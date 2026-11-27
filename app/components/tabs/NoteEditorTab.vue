<script setup lang="ts">
import { Columns2, Eye, Pencil, Rows2, Save } from "@lucide/vue"
import { toast } from "vue-sonner"
import { useNoteActions } from "~/composables/useNoteActions"
import { useVault } from "~/composables/useVault"
import { findFileEntryByWikiTarget, getWikiDisplayText } from "~/lib/vaultLink"
import { useTabsStore } from "~/stores/tabs"
import { useWorkspaceStore } from "~/stores/workspace"

const props = defineProps<{
  tabId: string
  filePath?: string
  initialContent?: string
}>()

const tabsStore = useTabsStore()
const workspaceStore = useWorkspaceStore()
const vault = useVault()
const { openNote } = useNoteActions()

const resolvedPath = computed(() => props.filePath ?? props.tabId)
const content = ref(props.initialContent ?? "")
const savedSnapshot = ref(props.initialContent ?? "")
const linkNotice = ref<string | null>(null)
const isSaving = ref(false)

const isDirty = computed(() => content.value !== savedSnapshot.value)
const wordCount = computed(() => {
  const trimmed = content.value.trim()
  return trimmed ? trimmed.split(/\s+/).length : 0
})

const formattedPreview = computed(() => {
  return content.value.replace(/\[\[([^\]]+)\]\]/g, (_match, inner: string) => {
    const label = getWikiDisplayText(inner)
    const encodedTarget = encodeURIComponent(inner.trim())
    return `[${label}](vault://${encodedTarget})`
  })
})

watch(content, (value) => {
  tabsStore.setDirty(props.tabId, value !== savedSnapshot.value)
  linkNotice.value = null
})

function errorMessage(cause: unknown): string {
  if (cause instanceof Error) return cause.message
  if (typeof cause === "string") return cause
  return "An unknown error occurred"
}

async function saveNote() {
  if (isSaving.value) return

  isSaving.value = true
  try {
    await vault.writeNote(resolvedPath.value, content.value)
    savedSnapshot.value = content.value
    tabsStore.setDirty(props.tabId, false)
  } finally {
    isSaving.value = false
  }
}

async function handleSave() {
  try {
    await saveNote()
    toast.success("Note saved")
  } catch (cause) {
    toast.error(errorMessage(cause))
  }
}

async function handlePreviewClick(event: MouseEvent) {
  const target = event.target as HTMLElement | null
  const anchor = target?.closest("a") as HTMLAnchorElement | null
  if (!anchor) return

  const href = anchor.getAttribute("href") ?? ""
  if (!href.startsWith("vault://")) return

  event.preventDefault()
  linkNotice.value = null

  const rawTarget = decodeURIComponent(href.slice("vault://".length))
  const matched = findFileEntryByWikiTarget(vault.fileTree.value, rawTarget)

  if (!matched) {
    linkNotice.value = `Note "${rawTarget}" was not found in this vault.`
    return
  }

  await openNote(matched)
}

function onViewModeChange(value: unknown) {
  if (value === "editor" || value === "preview" || value === "split") {
    workspaceStore.setViewMode(value)
  }
}

onMounted(() => {
  tabsStore.registerSaveHandler(props.tabId, saveNote)
})

onUnmounted(() => {
  tabsStore.unregisterSaveHandler(props.tabId)
})
</script>

<template>
  <div class="bg-background flex h-full min-h-0 flex-col overflow-hidden">
    <div class="flex h-11 shrink-0 items-center gap-2 border-b px-3">
      <UiToggleGroup
        type="single"
        :model-value="workspaceStore.viewMode"
        variant="outline"
        size="sm"
        @update:model-value="onViewModeChange"
      >
        <UiToggleGroupItem value="editor" title="Editor view (Ctrl/Cmd+1)">
          <Pencil class="size-4" />
          <span class="hidden sm:inline">Editor</span>
        </UiToggleGroupItem>
        <UiToggleGroupItem value="preview" title="Preview view (Ctrl/Cmd+2)">
          <Eye class="size-4" />
          <span class="hidden sm:inline">Preview</span>
        </UiToggleGroupItem>
        <UiToggleGroupItem value="split" title="Split view (Ctrl/Cmd+\)">
          <Columns2 class="size-4" />
          <span class="hidden sm:inline">Split</span>
        </UiToggleGroupItem>
      </UiToggleGroup>

      <UiButton
        v-if="workspaceStore.isSplit"
        variant="ghost"
        size="icon-sm"
        :title="
          workspaceStore.splitDirection === 'horizontal'
            ? 'Stack panels vertically'
            : 'Place panels side by side'
        "
        :aria-label="
          workspaceStore.splitDirection === 'horizontal'
            ? 'Stack panels vertically'
            : 'Place panels side by side'
        "
        @click="workspaceStore.toggleSplitDirection()"
      >
        <Rows2 v-if="workspaceStore.splitDirection === 'horizontal'" />
        <Columns2 v-else />
      </UiButton>

      <div class="ml-auto flex min-w-0 items-center gap-2">
        <span
          v-if="linkNotice"
          class="max-w-[30vw] truncate text-xs text-amber-600 dark:text-amber-400"
        >
          {{ linkNotice }}
        </span>

        <span
          class="text-muted-foreground hidden max-w-[28vw] truncate text-xs md:inline"
          :title="resolvedPath"
        >
          {{ resolvedPath }}
        </span>

        <span class="text-muted-foreground hidden text-xs sm:inline">
          {{ wordCount }} {{ wordCount === 1 ? "word" : "words" }}
        </span>

        <UiButton
          variant="ghost"
          size="icon-sm"
          title="Save note (Ctrl/Cmd+S)"
          aria-label="Save note"
          :disabled="!isDirty || isSaving"
          @click="handleSave"
        >
          <Save />
        </UiButton>
      </div>
    </div>

    <div class="min-h-0 flex-1 overflow-hidden">
      <AppEditor
        v-if="workspaceStore.viewMode === 'editor'"
        v-model="content"
        class="h-full"
      />

      <div
        v-else-if="workspaceStore.viewMode === 'preview'"
        class="h-full min-h-0"
        @click="handlePreviewClick"
      >
        <AppPreview :content="formattedPreview" class="h-full" />
      </div>

      <UiResizablePanelGroup
        v-else
        :direction="workspaceStore.splitDirection"
        class="h-full min-h-0"
      >
        <UiResizablePanel :default-size="50" :min-size="20" class="min-h-0">
          <AppEditor v-model="content" class="h-full" />
        </UiResizablePanel>

        <UiResizableHandle with-handle />

        <UiResizablePanel :default-size="50" :min-size="20" class="min-h-0">
          <div class="h-full min-h-0" @click="handlePreviewClick">
            <AppPreview :content="formattedPreview" class="h-full" />
          </div>
        </UiResizablePanel>
      </UiResizablePanelGroup>
    </div>
  </div>
</template>

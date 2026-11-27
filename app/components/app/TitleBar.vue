<script setup lang="ts">
import {
  Feather,
  Maximize2,
  Minimize2,
  Minus,
  Moon,
  Save,
  Search,
  Sun,
  X,
} from "@lucide/vue"

const { isTauri, minimize, toggleMaximize, close, isMaximized, onResized } =
  useTauri()
const { saveActiveNote, toggleTheme } = useNoteActions()
const { openCommandPalette } = useCommands()
const tabsStore = useTabsStore()
const colorMode = useColorMode()

const isDark = computed(() => colorMode.value === "dark")
const activeTab = computed(() => tabsStore.activeTab)
const isNoteTab = computed(() => activeTab.value?.componentKey === "note")
const isDirty = computed(() => Boolean(activeTab.value?.isDirty))

const maximized = ref(false)
const isSaving = ref(false)
let unlistenResize: (() => void) | undefined

async function handleSave() {
  if (isSaving.value) return

  isSaving.value = true
  try {
    await saveActiveNote()
  } finally {
    isSaving.value = false
  }
}

onMounted(async () => {
  if (!isTauri.value) return

  maximized.value = await isMaximized()
  unlistenResize = await onResized(async () => {
    maximized.value = await isMaximized()
  })
})

onUnmounted(() => unlistenResize?.())
</script>

<template>
  <header data-tauri-drag-region
    class="bg-background/95 flex h-10 w-full shrink-0 items-center gap-2 border-b px-2 backdrop-blur select-none">
    <UiSidebarTrigger class="shrink-0" />

    <div data-tauri-drag-region class="flex min-w-0 flex-1 items-center gap-2">
      <Feather class="text-primary size-4 shrink-0" />
      <span class="text-sm font-semibold tracking-tight">penna</span>

      <template v-if="activeTab">
        <span class="text-muted-foreground/50 text-sm">/</span>
        <span class="text-muted-foreground max-w-[40vw] truncate text-sm"
          :title="activeTab.subtitle ?? activeTab.title">
          {{ activeTab.subtitle ?? activeTab.title }}
        </span>
        <span v-if="isDirty" class="size-1.5 shrink-0 rounded-full bg-amber-500" title="Unsaved changes" />
      </template>
    </div>

    <div class="flex shrink-0 items-center gap-1">
      <UiButton variant="ghost" size="icon-sm" title="Command palette (Ctrl/Cmd+K)" aria-label="Open command palette"
        @click="openCommandPalette()">
        <Search />
      </UiButton>

      <UiButton v-if="isNoteTab" variant="ghost" size="icon-sm" title="Save note (Ctrl/Cmd+S)" aria-label="Save note"
        :disabled="!isDirty || isSaving" @click="handleSave">
        <Save />
      </UiButton>

      <UiButton variant="ghost" size="icon-sm" :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
        :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'" @click="toggleTheme">
        <Sun v-if="isDark" />
        <Moon v-else />
      </UiButton>

      <template v-if="isTauri">
        <span class="bg-border mx-1 h-4 w-px" />

        <button type="button" title="Minimize" aria-label="Minimize"
          class="text-muted-foreground hover:bg-accent hover:text-accent-foreground inline-flex size-8 items-center justify-center rounded-md transition-colors"
          @click="minimize">
          <Minus class="size-4" />
        </button>

        <button type="button" :title="maximized ? 'Restore' : 'Maximize'"
          :aria-label="maximized ? 'Restore' : 'Maximize'"
          class="text-muted-foreground hover:bg-accent hover:text-accent-foreground inline-flex size-8 items-center justify-center rounded-md transition-colors"
          @click="toggleMaximize">
          <Minimize2 v-if="maximized" class="size-4" />
          <Maximize2 v-else class="size-4" />
        </button>

        <button type="button" title="Close" aria-label="Close"
          class="text-muted-foreground hover:bg-destructive inline-flex size-8 items-center justify-center rounded-md transition-colors hover:text-white"
          @click="close">
          <X class="size-4" />
        </button>
      </template>
    </div>
  </header>
</template>

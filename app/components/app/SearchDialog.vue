<script setup lang="ts">
import { FileText, Loader2, Search } from "@lucide/vue"
import { useFormatForDisplay } from "@tanstack/vue-hotkeys"
import { useDialogSearchStore } from "~/stores/dialogSearch"
import type { SearchItem } from "~/types/search"

const searchDialogStore = useDialogSearchStore()
const formatForDisplay = useFormatForDisplay()

const inputRef = ref<HTMLInputElement | null>(null)
const itemRefs = ref<HTMLButtonElement[]>([])

const isOpen = computed({
  get: () => searchDialogStore.isOpen,
  set: (value: boolean) => {
    if (!value) searchDialogStore.close()
  },
})

const query = computed({
  get: () => searchDialogStore.query,
  set: (value: string) => {
    searchDialogStore.query = value
  },
})

watch(isOpen, async (open) => {
  if (!open) return

  await nextTick()
  inputRef.value?.focus()
})

watch(
  () => searchDialogStore.activeIndex,
  async (index) => {
    await nextTick()
    itemRefs.value[index]?.scrollIntoView({ block: "nearest" })
  }
)

function displayHotkey(item: SearchItem) {
  return item.hotkey ? formatForDisplay(item.hotkey) : null
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === "ArrowDown") {
    event.preventDefault()
    searchDialogStore.moveActive(1)
    return
  }

  if (event.key === "ArrowUp") {
    event.preventDefault()
    searchDialogStore.moveActive(-1)
    return
  }

  if (event.key === "Enter") {
    event.preventDefault()
    searchDialogStore.selectItem()
  }
}
</script>

<template>
  <UiDialog v-model:open="isOpen">
    <UiDialogContent class="!top-[15%] max-w-xl !translate-y-0 gap-0 overflow-hidden p-0" :show-close-button="false">
      <UiDialogTitle class="sr-only">Search dialog</UiDialogTitle>

      <div class="flex items-center gap-2 border-b px-3">
        <Loader2 v-if="searchDialogStore.isLoading" class="text-muted-foreground size-4 shrink-0 animate-spin" />
        <Search v-else class="text-muted-foreground size-4 shrink-0" />

        <input ref="inputRef" v-model="query" type="text" :placeholder="searchDialogStore.placeholder"
          class="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          @keydown="onKeydown" />

        <kbd
          class="text-muted-foreground bg-muted hidden rounded border px-1.5 py-0.5 text-[10px] font-medium sm:inline">
          Esc
        </kbd>
      </div>

      <div class="max-h-[min(60vh,420px)] overflow-y-auto p-2">
        <button v-for="(item, index) in searchDialogStore.filteredItems" :key="item.id" ref="itemRefs" type="button"
          class="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors" :class="index === searchDialogStore.activeIndex
              ? 'bg-accent text-accent-foreground'
              : 'text-foreground hover:bg-accent/60'
            " @click="searchDialogStore.selectItem(item)" @mouseenter="searchDialogStore.activeIndex = index">
          <component :is="item.icon ?? FileText" class="text-muted-foreground size-4 shrink-0" />

          <div class="min-w-0 flex-1">
            <div class="truncate">{{ item.title }}</div>
            <div v-if="item.subtitle" class="text-muted-foreground truncate text-xs">
              {{ item.subtitle }}
            </div>
          </div>

          <span v-if="item.group" class="text-muted-foreground hidden text-[11px] sm:inline">
            {{ item.group }}
          </span>

          <kbd v-if="displayHotkey(item)"
            class="text-muted-foreground bg-muted rounded border px-1.5 py-0.5 text-[10px] font-medium">
            {{ displayHotkey(item) }}
          </kbd>
        </button>

        <div v-if="!searchDialogStore.isLoading && searchDialogStore.filteredItems.length === 0"
          class="text-muted-foreground px-3 py-10 text-center text-sm">
          {{ searchDialogStore.emptyText }}
        </div>
      </div>
    </UiDialogContent>
  </UiDialog>
</template>

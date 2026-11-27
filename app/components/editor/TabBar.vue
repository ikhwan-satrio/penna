<script setup lang="ts">
const tabsStore = useTabsStore()

const contextMenu = reactive<{
  visible: boolean
  x: number
  y: number
  tabId: string | null
}>({
  visible: false,
  x: 0,
  y: 0,
  tabId: null,
})

function onContextMenu(event: MouseEvent, tabId: string) {
  event.preventDefault()

  contextMenu.visible = true
  contextMenu.x = Math.min(event.clientX, window.innerWidth - 180)
  contextMenu.y = Math.min(event.clientY, window.innerHeight - 130)
  contextMenu.tabId = tabId
}

function closeContextMenu() {
  contextMenu.visible = false
  contextMenu.tabId = null
}

function onCloseClick(event: MouseEvent, tabId: string) {
  event.stopPropagation()
  void tabsStore.closeTab(tabId)
}

function onAuxClick(event: MouseEvent, tabId: string) {
  if (event.button === 1) {
    event.preventDefault()
    void tabsStore.closeTab(tabId)
  }
}

function closeTabFromMenu(tabId: string) {
  closeContextMenu()
  void tabsStore.closeTab(tabId)
}

function closeOtherTabsFromMenu(tabId: string) {
  closeContextMenu()
  void tabsStore.closeOtherTabs(tabId)
}

function closeAllTabsFromMenu() {
  closeContextMenu()
  void tabsStore.closeAllTabs()
}

onMounted(() => {
  window.addEventListener("click", closeContextMenu)
})

onUnmounted(() => {
  window.removeEventListener("click", closeContextMenu)
})
</script>

<template>
  <div class="relative shrink-0">
    <div
      class="bg-muted/30 flex h-10 items-center overflow-x-auto border-b select-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      role="tablist"
    >
      <div
        v-for="tab in tabsStore.tabs"
        :key="tab.id"
        role="tab"
        :aria-selected="tab.id === tabsStore.activeTabId"
        class="group/tab relative flex h-full min-w-[132px] max-w-[220px] shrink-0 cursor-pointer items-center justify-between gap-2 border-r px-3 text-xs transition-colors"
        :class="
          tab.id === tabsStore.activeTabId
            ? 'bg-background text-foreground border-t-primary border-t-2'
            : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
        "
        @click="tabsStore.setActiveTab(tab.id)"
        @auxclick="onAuxClick($event, tab.id)"
        @contextmenu="onContextMenu($event, tab.id)"
      >
        <span class="truncate" :class="tab.isDirty ? 'italic' : ''">
          {{ tab.title }}
        </span>

        <button
          type="button"
          :title="
            tab.isDirty
              ? 'Unsaved changes - close tab'
              : `Close ${tab.title}`
          "
          :aria-label="
            tab.isDirty
              ? `${tab.title} has unsaved changes, close tab`
              : `Close ${tab.title}`
          "
          class="hover:bg-accent relative flex size-5 shrink-0 items-center justify-center rounded transition-colors"
          @click="onCloseClick($event, tab.id)"
        >
          <span
            v-if="tab.isDirty"
            class="size-2 rounded-full bg-amber-500 transition-opacity group-hover/tab:opacity-0"
          />
          <span
            class="absolute text-sm leading-none transition-opacity"
            :class="
              tab.isDirty
                ? 'opacity-0 group-hover/tab:opacity-100'
                : 'opacity-60 group-hover/tab:opacity-100'
            "
          >
            ×
          </span>
        </button>
      </div>
    </div>

    <div
      v-if="contextMenu.visible && contextMenu.tabId"
      :style="{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }"
      class="bg-popover text-popover-foreground fixed z-50 min-w-40 rounded-md border p-1 text-xs shadow-xl"
      @click.stop
    >
      <button
        type="button"
        class="hover:bg-accent hover:text-accent-foreground block w-full rounded-sm px-3 py-1.5 text-left"
        @click="closeTabFromMenu(contextMenu.tabId)"
      >
        Close
      </button>
      <button
        type="button"
        class="hover:bg-accent hover:text-accent-foreground block w-full rounded-sm px-3 py-1.5 text-left"
        @click="closeOtherTabsFromMenu(contextMenu.tabId)"
      >
        Close Others
      </button>
      <button
        type="button"
        class="text-destructive hover:bg-destructive/10 block w-full rounded-sm px-3 py-1.5 text-left"
        @click="closeAllTabsFromMenu"
      >
        Close All
      </button>
    </div>
  </div>
</template>

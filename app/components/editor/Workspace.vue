<script setup lang="ts">
import { Home } from "@lucide/vue"
import { tabRegistry } from "~/lib/tabRegistry"
import { useTabsStore } from "~/stores/tabs"

const tabsStore = useTabsStore()
const { openWelcome } = useNoteActions()

onMounted(tabsStore.hydrate)
</script>

<template>
  <div class="bg-background flex h-full min-h-0 flex-col overflow-hidden">
    <EditorTabBar />

    <div class="relative min-h-0 flex-1 overflow-hidden">
      <div
        v-for="tab in tabsStore.tabs"
        v-show="tab.id === tabsStore.activeTabId"
        :key="tab.id"
        class="absolute inset-0 min-h-0 overflow-hidden"
      >
        <component
          :is="tabRegistry[tab.componentKey]"
          v-bind="tab.props"
          :tab-id="tab.id"
        />
      </div>

      <div
        v-if="tabsStore.tabs.length === 0"
        class="text-muted-foreground flex h-full flex-col items-center justify-center gap-3 text-sm"
      >
        <p>All tabs are closed.</p>
        <UiButton variant="secondary" size="sm" @click="openWelcome">
          <Home class="size-4" />
          Open Welcome
        </UiButton>
      </div>
    </div>
  </div>
</template>

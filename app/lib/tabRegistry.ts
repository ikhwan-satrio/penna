import type { Component } from "vue"
import type { TabComponentKey } from "~/types/tabs"

export const tabRegistry: Record<TabComponentKey, Component> = {
  welcome: defineAsyncComponent(() => import("~/components/tabs/WelcomeTab.vue")),
  note: defineAsyncComponent(() => import("~/components/tabs/NoteEditorTab.vue")),
  settings: defineAsyncComponent(() => import("~/components/tabs/SettingsTab.vue")),
}

import type { Component } from "vue"
import type { AppHotkey } from "@tanstack/vue-hotkeys"

export interface Command {
  id: string
  title: string
  description?: string
  group: string
  icon?: Component
  hotkey?: AppHotkey | null
  run: () => void | Promise<void>
}

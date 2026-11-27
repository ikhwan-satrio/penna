import type { Component } from "vue"
import type { DisplayHotkey } from "@tanstack/vue-hotkeys"

export interface SearchItem {
  id: string
  title: string
  subtitle?: string
  group?: string
  icon?: Component
  hotkey?: DisplayHotkey | null
  meta?: Record<string, any>
}

export interface SearchConfig {
  placeholder?: string
  emptyText?: string
  items?: SearchItem[]
  /** Opsional: fungsi pencarian dinamis (misal untuk Grep / API search) */
  onSearch?: (query: string) => SearchItem[] | Promise<SearchItem[]>
  /** Event custom saat item dipilih (Enter / Click) */
  onSelect: (item: SearchItem) => void
}

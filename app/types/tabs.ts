export type TabComponentKey = "welcome" | "note" | "settings"

export interface EditorTab {
  id: string
  title: string
  subtitle?: string
  componentKey: TabComponentKey
  props?: Record<string, unknown>
  isDirty?: boolean
  isPinned?: boolean
}

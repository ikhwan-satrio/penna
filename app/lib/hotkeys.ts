import { defineAppHotkeys } from "@tanstack/vue-hotkeys"

export const appHotkeys = defineAppHotkeys({
  "command.palette": {
    hotkey: "Mod+K",
    meta: { name: "Command palette", group: "General" },
  },
  "vault.open": {
    hotkey: "Mod+O",
    meta: { name: "Open vault", group: "Vault" },
  },
  "vault.refresh": {
    hotkey: "Mod+Shift+R",
    meta: { name: "Refresh vault", group: "Vault" },
  },
  "note.new": {
    hotkey: "Mod+N",
    meta: { name: "New note", group: "Note" },
  },
  "note.save": {
    hotkey: "Mod+S",
    meta: { name: "Save note", group: "Note" },
    options: { ignoreInputs: false, preventDefault: true },
  },
  "view.editor": {
    hotkey: "Mod+1",
    meta: { name: "Editor view", group: "View" },
  },
  "view.preview": {
    hotkey: "Mod+2",
    meta: { name: "Preview view", group: "View" },
  },
  "view.toggle-split": {
    hotkey: "Mod+\\",
    meta: { name: "Toggle split view", group: "View" },
  },
  "view.toggle-split-orientation": {
    hotkey: "Mod+Shift+\\",
    meta: { name: "Toggle split orientation", group: "View" },
  },
  "tab.close": {
    hotkey: "Mod+W",
    meta: { name: "Close tab", group: "Tabs" },
  },
  "tab.next": {
    hotkey: "Mod+Alt+ArrowRight",
    meta: { name: "Next tab", group: "Tabs" },
  },
  "tab.previous": {
    hotkey: "Mod+Alt+ArrowLeft",
    meta: { name: "Previous tab", group: "Tabs" },
  },
  "theme.toggle": {
    hotkey: "Mod+Shift+L",
    meta: { name: "Toggle theme", group: "General" },
  },
  "settings.open": {
    hotkey: "Mod+,",
    meta: { name: "Open settings", group: "General" },
  },
  "welcome.open": {
    hotkey: null,
    meta: { name: "Open welcome", group: "General" },
  },
  "search.files": {
    hotkey: "Mod+F",
    meta: { name: "Search File", group: "Search" }
  },
  "search.word": {
    hotkey: "Mod+W",
    meta: { name: "Search File", group: "Search" }
  }

})

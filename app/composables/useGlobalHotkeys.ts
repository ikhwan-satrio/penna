import { useHotkeys } from "@tanstack/vue-hotkeys"
import { useNoteActions } from "~/composables/useNoteActions"
import { appHotkeys } from "~/lib/hotkeys"
import { useDialogSearchStore } from "~/stores/dialogSearch"

export function useGlobalHotkeys() {
  const commandStore = useDialogSearchStore()
  const actions = useNoteActions()
  const { openCommandPalette } = useCommands()

  useHotkeys([
    {
      hotkey: appHotkeys["command.palette"],
      callback: () => {
        if (commandStore.isOpen) {
          commandStore.close()
          return
        }
        openCommandPalette()
      },
    },
    {
      hotkey: appHotkeys["search.files"],
      callback: () => void actions.searchFile(),
    },
    {
      hotkey: appHotkeys["vault.open"],
      callback: () => void actions.openVault(),
    },
    {
      hotkey: appHotkeys["vault.refresh"],
      callback: () => void actions.refreshVault(),
    },
    {
      hotkey: appHotkeys["note.new"],
      callback: () => void actions.newNote(),
    },
    {
      hotkey: appHotkeys["note.save"],
      callback: () => void actions.saveActiveNote(),
    },
    {
      hotkey: appHotkeys["view.editor"],
      callback: () => actions.setViewMode("editor"),
    },
    {
      hotkey: appHotkeys["view.preview"],
      callback: () => actions.setViewMode("preview"),
    },
    {
      hotkey: appHotkeys["view.toggle-split"],
      callback: () => actions.toggleSplit(),
    },
    {
      hotkey: appHotkeys["view.toggle-split-orientation"],
      callback: () => actions.toggleSplitDirection(),
    },
    {
      hotkey: appHotkeys["tab.close"],
      callback: () => void actions.closeActiveTab(),
    },
    {
      hotkey: appHotkeys["tab.next"],
      callback: () => actions.nextTab(),
    },
    {
      hotkey: appHotkeys["tab.previous"],
      callback: () => actions.previousTab(),
    },
    {
      hotkey: appHotkeys["theme.toggle"],
      callback: () => actions.toggleTheme(),
    },
    {
      hotkey: appHotkeys["settings.open"],
      callback: () => actions.openSettings(),
    },
    {
      hotkey: appHotkeys["welcome.open"],
      callback: () => actions.openWelcome(),
    },
  ])
}

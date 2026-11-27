import {
  ChevronLeft,
  ChevronRight,
  Columns2,
  Eye,
  FilePlus,
  FolderOpen,
  Home,
  Pencil,
  RefreshCw,
  Rows2,
  Save,
  Search,
  Settings,
  SunMoon,
  X,
} from "@lucide/vue"
import { useNoteActions } from "~/composables/useNoteActions"
import { appHotkeys } from "~/lib/hotkeys"
import { useDialogSearchStore } from "~/stores/dialogSearch"
import type { Command } from "~/types/commands"
import type { SearchItem } from "~/types/search"

export function useCommands() {
  const commandStore = useDialogSearchStore()
  const actions = useNoteActions()

  const commands = computed<Command[]>(() => [
    {
      id: "command.palette",
      title: "Show command palette",
      group: "General",
      icon: Search,
      hotkey: appHotkeys["command.palette"],
      run: () => openCommandPalette(),
    },
    {
      id: "vault.open",
      title: "Open vault",
      group: "Vault",
      icon: FolderOpen,
      hotkey: appHotkeys["vault.open"],
      run: () => actions.openVault(),
    },
    {
      id: "vault.refresh",
      title: "Refresh vault",
      group: "Vault",
      icon: RefreshCw,
      hotkey: appHotkeys["vault.refresh"],
      run: () => actions.refreshVault(),
    },
    {
      id: "note.new",
      title: "New note",
      group: "Note",
      icon: FilePlus,
      hotkey: appHotkeys["note.new"],
      run: () => actions.newNote(),
    },
    {
      id: "note.save",
      title: "Save note",
      group: "Note",
      icon: Save,
      hotkey: appHotkeys["note.save"],
      run: () => actions.saveActiveNote(),
    },
    {
      id: "view.editor",
      title: "Editor view",
      group: "View",
      icon: Pencil,
      hotkey: appHotkeys["view.editor"],
      run: () => actions.setViewMode("editor"),
    },
    {
      id: "view.preview",
      title: "Preview view",
      group: "View",
      icon: Eye,
      hotkey: appHotkeys["view.preview"],
      run: () => actions.setViewMode("preview"),
    },
    {
      id: "view.toggle-split",
      title: "Toggle split view",
      group: "View",
      icon: Columns2,
      hotkey: appHotkeys["view.toggle-split"],
      run: () => actions.toggleSplit(),
    },
    {
      id: "view.toggle-split-orientation",
      title: "Toggle split orientation",
      group: "View",
      icon: Rows2,
      hotkey: appHotkeys["view.toggle-split-orientation"],
      run: () => actions.toggleSplitDirection(),
    },
    {
      id: "tab.close",
      title: "Close tab",
      group: "Tabs",
      icon: X,
      hotkey: appHotkeys["tab.close"],
      run: () => actions.closeActiveTab(),
    },
    {
      id: "tab.next",
      title: "Next tab",
      group: "Tabs",
      icon: ChevronRight,
      hotkey: appHotkeys["tab.next"],
      run: () => actions.nextTab(),
    },
    {
      id: "tab.previous",
      title: "Previous tab",
      group: "Tabs",
      icon: ChevronLeft,
      hotkey: appHotkeys["tab.previous"],
      run: () => actions.previousTab(),
    },
    {
      id: "theme.toggle",
      title: "Toggle theme",
      group: "General",
      icon: SunMoon,
      hotkey: appHotkeys["theme.toggle"],
      run: () => actions.toggleTheme(),
    },
    {
      id: "settings.open",
      title: "Open settings",
      group: "General",
      icon: Settings,
      hotkey: appHotkeys["settings.open"],
      run: () => actions.openSettings(),
    },
    {
      id: "welcome.open",
      title: "Open welcome",
      group: "General",
      icon: Home,
      hotkey: appHotkeys["welcome.open"],
      run: () => actions.openWelcome(),
    },
    {
      id: "search.files",
      title: "Search Files",
      group: "Search",
      icon: Search,
      hotkey: appHotkeys["search.files"],
      run: () => actions.searchFile(),
    },
    {
      id: "search.word",
      title: "Search Word",
      group: "Search",
      icon: Search,
      hotkey: appHotkeys["search.word"],
      run: () => actions.grepNotes(),
    },

  ])

  function runCommand(command: Command) {
    const opensSearchDialog = command.id === "search.files" || command.id === "command.palette"
    if (!opensSearchDialog) {
      commandStore.close()
    }
    void command.run()
  }

  function openCommandPalette() {
    const items: SearchItem[] = commands.value
      .filter((cmd) => cmd.id !== "command.palette")
      .map((cmd) => ({
        id: cmd.id,
        title: cmd.title,
        group: cmd.group,
        icon: cmd.icon,
        hotkey: cmd.hotkey?.hotkey,
        meta: { command: cmd },
      }))

    void commandStore.openWith({
      placeholder: "Type a command...",
      emptyText: "No commands found.",
      items,
      onSelect(item) {
        const cmd = item.meta?.command as Command | undefined
        if (cmd) runCommand(cmd)
      },
    })
  }

  return {
    commands,
    runCommand,
    openCommandPalette,
  }
}

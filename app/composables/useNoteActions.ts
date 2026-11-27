import { FileSearch, FileText } from "@lucide/vue"
import { toast } from "vue-sonner"
import { useTabsStore } from "~/stores/tabs"
import { useWorkspaceStore } from "~/stores/workspace"
import type { SearchItem } from "~/types/search"
import type { FileEntry } from "~/types/vault"
import type { NoteViewMode } from "~/types/workspace"

function errorMessage(cause: unknown): string {
  if (cause instanceof Error) return cause.message
  if (typeof cause === "string") return cause
  return "An unknown error occurred"
}

function subtitleFor(path: string): string {
  return path
    .replaceAll("\\", "/")
    .split("/")
    .filter(Boolean)
    .join(" / ")
}

function flattenFileEntries(entries: unknown): FileEntry[] {
  if (!Array.isArray(entries)) return []

  const result: FileEntry[] = []
  for (const raw of entries) {
    if (!raw || typeof raw !== "object") continue
    const entry = raw as FileEntry & { children?: unknown }

    if (!entry.is_dir && entry.path) {
      result.push(entry)
    }

    if (Array.isArray(entry.children) && entry.children.length > 0) {
      result.push(...flattenFileEntries(entry.children))
    }
  }
  return result
}

export function useNoteActions() {
  const tabsStore = useTabsStore()
  const workspaceStore = useWorkspaceStore()
  const vault = useVault()
  const colorMode = useColorMode()
  const dialog = useDialogSearchStore()

  async function openNote(entry: FileEntry) {
    if (entry.is_dir) return

    const existing = tabsStore.tabs.find((tab) => tab.id === entry.path)
    if (existing) {
      tabsStore.setActiveTab(existing.id)
      return
    }

    try {
      const content = await vault.readNote(entry.path)
      tabsStore.openTab({
        id: entry.path,
        title: entry.name,
        subtitle: subtitleFor(entry.path),
        componentKey: "note",
        props: {
          filePath: entry.path,
          initialContent: content,
        },
      })
    } catch (cause) {
      toast.error(errorMessage(cause))
    }
  }

  async function grepNotes() {
    if (!vault.vaultPath.value) {
      toast.info("Open a vault first.")
      return
    }

    const rawSource = vault.fileTree.value

    const files = flattenFileEntries(rawSource)

    const fileContents = await Promise.all(
      files.map(async (file) => {
        try {
          const content = await vault.readNote(file.path)
          return { file, lines: content.split(/\r?\n/) }
        } catch {
          return { file, lines: [] }
        }
      })
    )

    await dialog.openWith({
      placeholder: "Search words across all notes...",
      emptyText: "Type a word to search across notes.",
      onSearch(rawQuery) {
        const terms = rawQuery
          .trim()
          .toLowerCase()
          .split(/\s+/)
          .filter(Boolean)

        if (terms.length === 0) return []

        const results: SearchItem[] = []
        const MAX_RESULTS = 100

        for (const { file, lines } of fileContents) {
          for (let i = 0; i < lines.length; i++) {
            const lineText = lines[i] ?? ""
            const lowerLine = lineText.toLowerCase()

            // Cocokkan semua kata yang diketik (multi-word search)
            const isMatch = terms.every((term) => lowerLine.includes(term))
            if (!isMatch) continue

            results.push({
              id: `${file.path}:${i + 1}`,
              title: lineText.trim() || "(Empty line)",
              subtitle: `${subtitleFor(file.path)} : Line ${i + 1}`,
              group: "Grep",
              icon: FileSearch,
              meta: {
                entry: file,
                line: i + 1,
                query: rawQuery.trim(),
              },
            })

            if (results.length >= MAX_RESULTS) return results
          }
        }

        return results
      },
      async onSelect(item) {
        const entry = item.meta?.entry as FileEntry | undefined
        const line = item.meta?.line as number | undefined
        if (!entry) return

        await openNote(entry)

        // Opsional: kirim event / simpan target baris ke workspaceStore agar editor auto-scroll ke baris tersebut
        if (line) {
          window.dispatchEvent(
            new CustomEvent("note:goto-line", {
              detail: { filePath: entry.path, line, query: item.meta?.query },
            })
          )
        }
      },
    })
  }

  async function searchFile() {
    if (!vault.vaultPath.value) {
      toast.info("Open a vault first.")
      return
    }

    const rawSource = vault.fileTree.value

    const files = flattenFileEntries(rawSource)

    const items: SearchItem[] = files.map((file) => ({
      id: file.path,
      title: file.name,
      subtitle: subtitleFor(file.path),
      group: "Files",
      icon: FileText,
      meta: { entry: file },
    }))

    await dialog.openWith({
      placeholder: "Search files in vault...",
      emptyText: files.length === 0 ? "No files in vault." : "No matching files.",
      items,
      onSelect(item) {
        const entry = item.meta?.entry as FileEntry | undefined
        if (entry) {
          void openNote(entry)
        }
      },
    })
  }

  // ... method lain di useNoteActions() tetap sama ...
  async function openVault() {
    const previous = vault.vaultPath.value
    await vault.chooseVault()

    if (vault.error.value) {
      toast.error(vault.error.value)
      return
    }

    if (vault.vaultPath.value && vault.vaultPath.value !== previous) {
      tabsStore.reset()
      toast.success(`Opened vault "${vault.vaultName.value ?? vault.vaultPath.value}"`)
    }
  }

  async function refreshVault() {
    await vault.refresh()

    if (vault.error.value) {
      toast.error(vault.error.value)
      return
    }

    if (!vault.vaultPath.value) {
      toast.info("Open a vault first.")
      return
    }

    toast.success("Vault refreshed")
  }

  async function newNote() {
    if (!vault.vaultPath.value) {
      await openVault()
      if (!vault.vaultPath.value) return
    }

    try {
      const entry = await vault.createNote("Untitled")
      await openNote(entry)
      toast.success(`Created ${entry.name}`)
    } catch (cause) {
      toast.error(errorMessage(cause))
    }
  }

  async function saveActiveNote() {
    if (tabsStore.activeTab?.componentKey !== "note") return

    try {
      await tabsStore.saveActiveTab()
      toast.success("Note saved")
    } catch (cause) {
      toast.error(errorMessage(cause))
    }
  }

  async function closeActiveTab() {
    if (tabsStore.activeTabId) {
      await tabsStore.closeTab(tabsStore.activeTabId)
    }
  }

  function nextTab() {
    tabsStore.nextTab()
  }

  function previousTab() {
    tabsStore.prevTab()
  }

  function openSettings() {
    tabsStore.openTab({
      id: "settings",
      title: "Settings",
      subtitle: "workspace / settings",
      componentKey: "settings",
    })
  }

  function openWelcome() {
    tabsStore.openTab({
      id: "welcome",
      title: "Welcome",
      subtitle: "workspace / welcome",
      componentKey: "welcome",
    })
  }

  function setViewMode(mode: NoteViewMode) {
    workspaceStore.setViewMode(mode)
  }

  function toggleSplit() {
    workspaceStore.toggleSplit()
  }

  function toggleSplitDirection() {
    workspaceStore.toggleSplitDirection()
  }

  function toggleTheme() {
    colorMode.preference = colorMode.value === "dark" ? "light" : "dark"
  }

  return {
    openVault,
    refreshVault,
    openNote,
    newNote,
    saveActiveNote,
    closeActiveTab,
    nextTab,
    previousTab,
    openSettings,
    openWelcome,
    setViewMode,
    toggleSplit,
    toggleSplitDirection,
    toggleTheme,
    searchFile,
    grepNotes
  }
}

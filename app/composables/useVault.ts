import type { FileEntry } from "~/types/vault"

function toErrorMessage(error: unknown) {
  if (typeof error === "string") return error
  if (error instanceof Error) return error.message
  return "An unknown error occurred"
}

async function invokeTauri<T>(command: string, args?: Record<string, unknown>) {
  const { invoke } = await import("@tauri-apps/api/core")
  return invoke<T>(command, args)
}

function flattenFiles(entries: FileEntry[]): FileEntry[] {
  return entries.flatMap((entry) =>
    entry.is_dir ? flattenFiles(entry.children ?? []) : [entry],
  )
}

function findFile(entries: FileEntry[], path: string): FileEntry | null {
  for (const entry of entries) {
    if (entry.is_dir) {
      const match = findFile(entry.children ?? [], path)
      if (match) return match
      continue
    }

    if (entry.path === path) return entry
  }

  return null
}

export function useVault() {
  const { isTauri } = useTauri()

  const vaultPath = useState<string | null>("penna:vault-path", () => null)
  const fileTree = useState<FileEntry[]>("penna:file-tree", () => [])
  const loading = useState<boolean>("penna:loading", () => false)
  const error = useState<string | null>("penna:error", () => null)

  const vaultName = computed(() => {
    if (!vaultPath.value) return null
    return vaultPath.value.split(/[\\/]/).filter(Boolean).pop() ?? vaultPath.value
  })

  const noteCount = computed(() => flattenFiles(fileTree.value).length)

  function assertDesktop() {
    if (!isTauri.value) {
      throw new Error("Vault access is only available in the desktop app.")
    }
  }

  async function refresh() {
    if (!isTauri.value) return

    loading.value = true
    error.value = null

    try {
      const path = await invokeTauri<string | null>("get_vault_path")
      vaultPath.value = path
      fileTree.value = path ? await invokeTauri<FileEntry[]>("get_file_tree") : []
    } catch (cause) {
      error.value = toErrorMessage(cause)
    } finally {
      loading.value = false
    }
  }

  async function chooseVault() {
    if (!isTauri.value) {
      error.value = "The folder picker is only available in the desktop app."
      return
    }

    try {
      const { open } = await import("@tauri-apps/plugin-dialog")
      const selected = await open({
        directory: true,
        multiple: false,
        title: "Choose a notes vault folder",
      })

      if (typeof selected !== "string") return

      await invokeTauri("set_vault_path", { path: selected })
      await refresh()
    } catch (cause) {
      error.value = toErrorMessage(cause)
    }
  }

  async function readNote(path: string): Promise<string> {
    assertDesktop()
    return invokeTauri<string>("read_file", { relativePath: path })
  }

  async function writeNote(path: string, content: string): Promise<void> {
    assertDesktop()
    await invokeTauri("write_file", { relativePath: path, content })
  }

  function uniqueNoteName(baseName: string): string {
    const sanitized = baseName.trim().replace(/[\\/:*?"<>|]/g, "-") || "Untitled"
    const stem = sanitized.replace(/\.md$/i, "")
    const existing = new Set(
      flattenFiles(fileTree.value).map((entry) => entry.name.toLowerCase()),
    )

    let candidate = `${stem}.md`
    let index = 2

    while (existing.has(candidate.toLowerCase())) {
      candidate = `${stem} ${index}.md`
      index += 1
    }

    return candidate
  }

  async function createNote(
    baseName = "Untitled",
    initialContent = "",
  ): Promise<FileEntry> {
    assertDesktop()
    if (!vaultPath.value) throw new Error("Open a vault first.")

    const name = uniqueNoteName(baseName)
    await writeNote(name, initialContent)
    await refresh()

    return (
      findFile(fileTree.value, name) ?? {
        name,
        path: name,
        is_dir: false,
      }
    )
  }

  return {
    isTauri,
    vaultPath,
    vaultName,
    fileTree,
    loading,
    error,
    noteCount,
    refresh,
    chooseVault,
    readNote,
    writeNote,
    createNote,
  }
}

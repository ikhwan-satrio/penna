import type { NoteViewMode, SplitDirection } from "~/types/workspace"

const STORAGE_KEY = "penna:workspace.v1"

interface PersistedWorkspace {
  viewMode?: NoteViewMode
  splitDirection?: SplitDirection
}

function readPersistedState(): PersistedWorkspace {
  if (!import.meta.client) return {}

  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") as PersistedWorkspace
  } catch {
    return {}
  }
}

export const useWorkspaceStore = defineStore("workspace", () => {
  const persisted = readPersistedState()

  const viewMode = ref<NoteViewMode>(
    persisted.viewMode === "preview" || persisted.viewMode === "split"
      ? persisted.viewMode
      : "editor",
  )

  const splitDirection = ref<SplitDirection>(
    persisted.splitDirection === "vertical" ? "vertical" : "horizontal",
  )

  const isSplit = computed(() => viewMode.value === "split")

  watch([viewMode, splitDirection], () => {
    if (!import.meta.client) return

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        viewMode: viewMode.value,
        splitDirection: splitDirection.value,
      }),
    )
  })

  function setViewMode(mode: NoteViewMode) {
    viewMode.value = mode
  }

  function toggleSplit() {
    viewMode.value = isSplit.value ? "editor" : "split"
  }

  function toggleSplitDirection() {
    splitDirection.value =
      splitDirection.value === "horizontal" ? "vertical" : "horizontal"
  }

  return {
    viewMode,
    splitDirection,
    isSplit,
    setViewMode,
    toggleSplit,
    toggleSplitDirection,
  }
})

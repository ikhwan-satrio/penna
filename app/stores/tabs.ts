import { useDialogStore } from "./dialogs"
import type { EditorTab } from "~/types/tabs"

const STORAGE_KEY = "penna:tabs.v1"

type SaveHandler = () => void | Promise<void>

function createWelcomeTab(): EditorTab {
  return {
    id: "welcome",
    title: "Welcome",
    subtitle: "workspace / welcome",
    componentKey: "welcome",
    isDirty: false,
    isPinned: false,
  }
}

export const useTabsStore = defineStore("tabs", () => {
  const route = useRoute()
  const router = useRouter()
  const dialogStore = useDialogStore()

  const tabs = ref<EditorTab[]>([])
  const activeTabId = ref<string | null>(null)
  const isHydrated = ref(false)
  const saveHandlers = new Map<string, SaveHandler>()

  const activeTab = computed(
    () => tabs.value.find((tab) => tab.id === activeTabId.value) ?? null,
  )

  function syncUrlQuery() {
    if (!import.meta.client) return

    const currentQueryTab =
      typeof route.query.tab === "string" ? route.query.tab : null
    const nextQueryTab = activeTabId.value

    if (currentQueryTab === nextQueryTab) return

    router.replace({
      query: {
        ...route.query,
        tab: nextQueryTab ?? undefined,
      },
    })
  }

  function persistToStorage() {
    if (!import.meta.client || !isHydrated.value) return

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          tabs: tabs.value,
          activeTabId: activeTabId.value,
        }),
      )
    } catch {
      // Ignore storage quota errors.
    }
  }

  function pruneSaveHandlers() {
    for (const tabId of saveHandlers.keys()) {
      if (!tabs.value.some((tab) => tab.id === tabId)) {
        saveHandlers.delete(tabId)
      }
    }
  }

  function hydrate() {
    if (!import.meta.client || isHydrated.value) return

    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as {
          tabs?: EditorTab[]
          activeTabId?: string | null
        }

        if (Array.isArray(parsed.tabs)) {
          tabs.value = parsed.tabs.map((tab) => {
            if (tab.componentKey !== "note") {
              return { ...tab, isDirty: false }
            }

            const props = { ...(tab.props ?? {}) }
            delete props.initialContent

            return { ...tab, props, isDirty: false }
          })
        }

        if (typeof parsed.activeTabId === "string") {
          activeTabId.value = parsed.activeTabId
        }
      }
    } catch {
      // Ignore malformed storage data.
    }

    const queryTabId =
      typeof route.query.tab === "string" ? route.query.tab : null

    if (queryTabId && tabs.value.some((tab) => tab.id === queryTabId)) {
      activeTabId.value = queryTabId
    } else if (
      activeTabId.value &&
      !tabs.value.some((tab) => tab.id === activeTabId.value)
    ) {
      activeTabId.value = tabs.value[0]?.id ?? null
    }

    if (tabs.value.length === 0) {
      tabs.value = [createWelcomeTab()]
      activeTabId.value = "welcome"
    }

    isHydrated.value = true
    syncUrlQuery()
    persistToStorage()
  }

  function reset() {
    tabs.value = [createWelcomeTab()]
    activeTabId.value = "welcome"
    isHydrated.value = true
    saveHandlers.clear()
    syncUrlQuery()
    persistToStorage()
  }

  function setActiveTab(tabId: string) {
    if (!tabs.value.some((tab) => tab.id === tabId)) return

    activeTabId.value = tabId
    syncUrlQuery()
    persistToStorage()
  }

  function openTab(newTab: EditorTab) {
    const existing = tabs.value.find((tab) => tab.id === newTab.id)

    if (existing) {
      existing.title = newTab.title
      existing.subtitle = newTab.subtitle ?? existing.subtitle
      existing.props = newTab.props ?? existing.props
      setActiveTab(existing.id)
      return
    }

    tabs.value.push({
      isDirty: false,
      isPinned: false,
      ...newTab,
    })
    setActiveTab(newTab.id)
  }

  async function closeTab(tabId: string, force = false): Promise<boolean> {
    const index = tabs.value.findIndex((tab) => tab.id === tabId)
    if (index === -1) return true

    const target = tabs.value[index]
    if (!target) return true

    if (target.isDirty && !force && import.meta.client) {
      const confirmed = await dialogStore.open(
        `"${target.title}" has unsaved changes. Close it anyway?`,
        {
          title: "Unsaved Changes",
          confirmText: "Close Anyway",
          cancelText: "Cancel",
          variant: "destructive",
        },
      )

      if (!confirmed) return false
    }

    const currentIndex = tabs.value.findIndex((tab) => tab.id === tabId)
    if (currentIndex === -1) return true

    const wasActive = activeTabId.value === tabId
    tabs.value.splice(currentIndex, 1)
    saveHandlers.delete(tabId)

    if (wasActive) {
      const fallback =
        tabs.value[currentIndex] ?? tabs.value[currentIndex - 1] ?? null
      activeTabId.value = fallback?.id ?? null
    }

    syncUrlQuery()
    persistToStorage()
    return true
  }

  async function closeOtherTabs(keepTabId: string) {
    const candidates = tabs.value.filter(
      (tab) => tab.id !== keepTabId && !tab.isPinned,
    )
    const idsToKeep = new Set<string>()

    for (const tab of candidates) {
      if (tab.isDirty && import.meta.client) {
        const confirmed = await dialogStore.open(
          `"${tab.title}" has unsaved changes. Close it anyway?`,
          {
            title: "Unsaved Changes",
            confirmText: "Close Anyway",
            cancelText: "Cancel",
            variant: "destructive",
          },
        )

        if (!confirmed) {
          idsToKeep.add(tab.id)
        }
      }
    }

    tabs.value = tabs.value.filter(
      (tab) => tab.id === keepTabId || tab.isPinned || idsToKeep.has(tab.id),
    )
    activeTabId.value = tabs.value.some((tab) => tab.id === keepTabId)
      ? keepTabId
      : (tabs.value[0]?.id ?? null)

    pruneSaveHandlers()
    syncUrlQuery()
    persistToStorage()
  }

  async function closeAllTabs() {
    const candidates = tabs.value.filter((tab) => !tab.isPinned)
    const idsToKeep = new Set<string>()

    for (const tab of candidates) {
      if (tab.isDirty && import.meta.client) {
        const confirmed = await dialogStore.open(
          `"${tab.title}" has unsaved changes. Close it anyway?`,
          {
            title: "Unsaved Changes",
            confirmText: "Close Anyway",
            cancelText: "Cancel",
            variant: "destructive",
          },
        )

        if (!confirmed) {
          idsToKeep.add(tab.id)
        }
      }
    }

    tabs.value = tabs.value.filter(
      (tab) => tab.isPinned || idsToKeep.has(tab.id),
    )
    activeTabId.value = tabs.value[0]?.id ?? null

    pruneSaveHandlers()
    syncUrlQuery()
    persistToStorage()
  }

  function setDirty(tabId: string, dirty: boolean) {
    const tab = tabs.value.find((item) => item.id === tabId)
    if (!tab) return

    tab.isDirty = dirty
    persistToStorage()
  }

  function registerSaveHandler(tabId: string, handler: SaveHandler) {
    saveHandlers.set(tabId, handler)
  }

  function unregisterSaveHandler(tabId: string) {
    saveHandlers.delete(tabId)
  }

  async function saveTab(tabId: string) {
    const handler = saveHandlers.get(tabId)
    if (handler) await handler()
  }

  async function saveActiveTab() {
    if (activeTabId.value) {
      await saveTab(activeTabId.value)
    }
  }

  function nextTab() {
    if (tabs.value.length <= 1 || !activeTabId.value) return

    const index = tabs.value.findIndex((tab) => tab.id === activeTabId.value)
    const next = tabs.value[(index + 1) % tabs.value.length]
    if (next) setActiveTab(next.id)
  }

  function prevTab() {
    if (tabs.value.length <= 1 || !activeTabId.value) return

    const index = tabs.value.findIndex((tab) => tab.id === activeTabId.value)
    const previous =
      tabs.value[(index - 1 + tabs.value.length) % tabs.value.length]
    if (previous) setActiveTab(previous.id)
  }

  watch(
    () => route.query.tab,
    (queryTab) => {
      if (!isHydrated.value || typeof queryTab !== "string") return

      if (
        queryTab !== activeTabId.value &&
        tabs.value.some((tab) => tab.id === queryTab)
      ) {
        activeTabId.value = queryTab
        persistToStorage()
      }
    },
  )

  return {
    tabs,
    activeTabId,
    activeTab,
    hydrate,
    reset,
    setActiveTab,
    openTab,
    closeTab,
    closeOtherTabs,
    closeAllTabs,
    setDirty,
    registerSaveHandler,
    unregisterSaveHandler,
    saveTab,
    saveActiveTab,
    nextTab,
    prevTab,
  }
})

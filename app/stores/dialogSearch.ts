import { defineStore } from "pinia"
import type { SearchConfig, SearchItem } from "~/types/search"

export const useDialogSearchStore = defineStore("dialog-search", () => {
  const isOpen = ref(false)
  const query = ref("")
  const items = ref<SearchItem[]>([])
  const activeIndex = ref(0)
  const isLoading = ref(false)

  const placeholder = ref("Type a command or search...")
  const emptyText = ref("No results found.")

  // Callback custom dari pemanggil (Note, Command Palette, Grep, dll)
  let onSelectHandler: ((item: SearchItem) => void) | null = null
  let onSearchHandler: ((q: string) => SearchItem[] | Promise<SearchItem[]>) | null = null

  const activeItem = computed(() => items.value[activeIndex.value] ?? null)

  // Jalankan filter bawaan atau custom onSearch (untuk grep/async)
  watch(query, async (val) => {
    activeIndex.value = 0

    if (onSearchHandler) {
      isLoading.value = true
      try {
        items.value = await onSearchHandler(val)
      } finally {
        isLoading.value = false
      }
    }
  })

  // Daftar item terfilter (jika tidak pakai custom onSearch)
  const filteredItems = computed(() => {
    if (onSearchHandler) return items.value

    const needle = query.value.trim().toLowerCase()
    if (!needle) return items.value

    return items.value.filter(
      (item) =>
        item.title.toLowerCase().includes(needle) ||
        item.subtitle?.toLowerCase().includes(needle) ||
        item.group?.toLowerCase().includes(needle)
    )
  })

  function toggle() {
    isOpen.value = !isOpen.value
  }

  function moveActive(delta: number) {
    const total = filteredItems.value.length
    if (total === 0) return
    activeIndex.value = (activeIndex.value + delta + total) % total
  }

  function selectItem(item?: SearchItem) {
    const target = item ?? filteredItems.value[activeIndex.value]
    if (!target) return

    const handler = onSelectHandler
    close()
    handler?.(target)
  }

  /**
   * Buka dialog dengan mode & event custom
   */
  async function openWith(config: SearchConfig) {
    query.value = ""
    activeIndex.value = 0
    placeholder.value = config.placeholder ?? "Search..."
    emptyText.value = config.emptyText ?? "No results found."
    onSelectHandler = config.onSelect
    onSearchHandler = config.onSearch ?? null

    if (config.onSearch) {
      isLoading.value = true
      items.value = await config.onSearch("")
      isLoading.value = false
    } else {
      items.value = config.items ?? []
    }

    isOpen.value = true
  }

  function close() {
    isOpen.value = false
  }

  return {
    isOpen,
    query,
    items,
    filteredItems,
    activeIndex,
    activeItem,
    isLoading,
    placeholder,
    emptyText,
    moveActive,
    selectItem,
    openWith,
    close,
    toggle
  }
})

export function useTauri() {
  const isTauri = computed(
    () => typeof window !== "undefined" && "__TAURI_INTERNALS__" in window,
  )

  async function getWindow() {
    if (!isTauri.value) return null
    const { getCurrentWindow } = await import("@tauri-apps/api/window")
    return getCurrentWindow()
  }

  async function minimize() {
    const win = await getWindow()
    await win?.minimize()
  }

  async function toggleMaximize() {
    const win = await getWindow()
    await win?.toggleMaximize()
  }

  async function close() {
    const win = await getWindow()
    await win?.close()
  }

  async function isMaximized() {
    const win = await getWindow()
    return win ? await win.isMaximized() : false
  }

  async function onResized(callback: () => void) {
    const win = await getWindow()
    if (!win) return () => {}
    return win.onResized(callback)
  }

  return {
    isTauri,
    minimize,
    toggleMaximize,
    close,
    isMaximized,
    onResized,
  }
}

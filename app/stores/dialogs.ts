export interface ConfirmDialogOptions {
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: "default" | "destructive"
}

export const useDialogStore = defineStore("dialog", () => {
  const isOpen = ref(false)
  const title = ref("Confirm")
  const description = ref("")
  const confirmText = ref("Continue")
  const cancelText = ref("Cancel")
  const variant = ref<"default" | "destructive">("default")

  let resolver: ((value: boolean) => void) | null = null

  function settle(result: boolean) {
    isOpen.value = false
    const resolve = resolver
    resolver = null
    resolve?.(result)
  }

  function open(
    text: string,
    options: ConfirmDialogOptions = {},
  ): Promise<boolean> {
    if (resolver) {
      settle(false)
    }

    title.value = options.title ?? "Confirm"
    description.value = text
    confirmText.value = options.confirmText ?? "Continue"
    cancelText.value = options.cancelText ?? "Cancel"
    variant.value = options.variant ?? "default"
    isOpen.value = true

    return new Promise<boolean>((resolve) => {
      resolver = resolve
    })
  }

  function confirm() {
    settle(true)
  }

  function cancel() {
    settle(false)
  }

  return {
    isOpen,
    title,
    description,
    confirmText,
    cancelText,
    variant,
    open,
    confirm,
    cancel,
  }
})

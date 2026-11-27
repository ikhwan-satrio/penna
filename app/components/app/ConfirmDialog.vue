<script setup lang="ts">
import { useDialogStore } from "~/stores/dialogs"

const dialogStore = useDialogStore()

const isOpen = computed({
  get: () => dialogStore.isOpen,
  set: (value: boolean) => {
    if (!value) dialogStore.cancel()
  },
})
</script>

<template>
  <UiDialog v-model:open="isOpen">
    <UiDialogContent :show-close-button="false" class="max-w-md">
      <UiDialogHeader>
        <UiDialogTitle>{{ dialogStore.title }}</UiDialogTitle>
        <UiDialogDescription class="whitespace-pre-line">
          {{ dialogStore.description }}
        </UiDialogDescription>
      </UiDialogHeader>

      <UiDialogFooter class="gap-2">
        <UiButton variant="outline" @click="dialogStore.cancel()">
          {{ dialogStore.cancelText }}
        </UiButton>
        <UiButton
          :variant="
            dialogStore.variant === 'destructive' ? 'destructive' : 'default'
          "
          @click="dialogStore.confirm()"
        >
          {{ dialogStore.confirmText }}
        </UiButton>
      </UiDialogFooter>
    </UiDialogContent>
  </UiDialog>
</template>

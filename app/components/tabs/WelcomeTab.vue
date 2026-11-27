<script setup lang="ts">
import { Feather, FilePlus, FolderOpen, Settings } from "@lucide/vue"
import { useAppHotkeyList, useFormatForDisplay } from "@tanstack/vue-hotkeys"

const { newNote, openVault, openSettings } = useNoteActions()
const hotkeys = useAppHotkeyList()
const formatForDisplay = useFormatForDisplay()

const shortcutIds = [
  "note.new",
  "note.save",
  "command.palette",
  "tab.close",
]

const shortcuts = computed(() =>
  hotkeys.value
    .filter((item) => shortcutIds.includes(item.appHotkey.id))
    .map((item) => {
      const hotkey = item.appHotkey.hotkey

      return {
        id: item.appHotkey.id,
        label: item.appHotkey.meta?.name ?? item.appHotkey.id,
        keys: hotkey ? formatForDisplay(hotkey) : "Unassigned",
      }
    }),
)
</script>

<template>
  <div class="flex h-full min-h-0 flex-col overflow-y-auto">
    <div
      class="m-auto flex w-full max-w-lg flex-col items-center gap-6 px-6 py-10 text-center"
    >
      <div
        class="bg-primary/10 text-primary ring-primary/20 flex size-16 items-center justify-center rounded-2xl ring-1"
      >
        <Feather class="size-8" />
      </div>

      <div class="space-y-2">
        <h1 class="text-2xl font-semibold tracking-tight">
          Welcome to penna
        </h1>
        <p class="text-muted-foreground text-sm leading-6">
          A quiet place for your Markdown notes. Open a vault, start writing,
          and preview your thoughts side by side.
        </p>
      </div>

      <div class="flex flex-wrap items-center justify-center gap-2">
        <UiButton @click="newNote">
          <FilePlus class="size-4" />
          New note
        </UiButton>
        <UiButton variant="outline" @click="openVault">
          <FolderOpen class="size-4" />
          Open vault
        </UiButton>
        <UiButton variant="ghost" @click="openSettings">
          <Settings class="size-4" />
          Settings
        </UiButton>
      </div>

      <div
        class="border-border/70 bg-muted/30 w-full rounded-xl border p-4 text-left"
      >
        <p
          class="text-muted-foreground mb-3 text-xs font-medium tracking-wide uppercase"
        >
          Shortcuts
        </p>
        <ul class="space-y-2">
          <li
            v-for="shortcut in shortcuts"
            :key="shortcut.id"
            class="flex items-center justify-between gap-3 text-sm"
          >
            <span class="text-muted-foreground">{{ shortcut.label }}</span>
            <kbd
              class="bg-background rounded border px-2 py-0.5 font-mono text-[11px]"
            >
              {{ shortcut.keys }}
            </kbd>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

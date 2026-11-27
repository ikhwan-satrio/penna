<script setup lang="ts">
import { Moon, Sun } from "@lucide/vue"
import { useAppHotkeyList, useFormatForDisplay } from "@tanstack/vue-hotkeys"

const hotkeys = useAppHotkeyList()
const formatForDisplay = useFormatForDisplay()
const colorMode = useColorMode()

const isDark = computed(() => colorMode.value === "dark")

const groups = computed(() => {
  const grouped = new Map<
    string,
    Array<{ id: string; label: string; keys: string }>
  >()

  for (const item of hotkeys.value) {
    const group = item.appHotkey.meta?.group ?? "General"
    const hotkey = item.appHotkey.hotkey
    const entries = grouped.get(group) ?? []

    entries.push({
      id: item.appHotkey.id,
      label: item.appHotkey.meta?.name ?? item.appHotkey.id,
      keys: hotkey ? formatForDisplay(hotkey) : "Unassigned",
    })

    grouped.set(group, entries)
  }

  return Array.from(grouped, ([name, items]) => ({ name, items }))
})

function toggleTheme() {
  colorMode.preference = isDark.value ? "light" : "dark"
}
</script>

<template>
  <div class="flex h-full min-h-0 flex-col overflow-y-auto">
    <div class="mx-auto w-full max-w-2xl space-y-8 p-6">
      <div>
        <h1 class="text-lg font-semibold tracking-tight">Settings</h1>
        <p class="text-muted-foreground mt-1 text-sm">
          Personalize your workspace and review keyboard shortcuts.
        </p>
      </div>

      <section class="space-y-3">
        <h2 class="text-sm font-medium">Appearance</h2>

        <div
          class="border-border/70 bg-muted/20 flex items-center justify-between gap-4 rounded-xl border p-4"
        >
          <div>
            <p class="text-sm font-medium">Theme</p>
            <p class="text-muted-foreground text-xs">
              Currently using {{ isDark ? "dark" : "light" }} mode.
            </p>
          </div>

          <UiButton variant="outline" size="sm" @click="toggleTheme">
            <Sun v-if="isDark" class="size-4" />
            <Moon v-else class="size-4" />
            {{ isDark ? "Light" : "Dark" }}
          </UiButton>
        </div>
      </section>

      <section class="space-y-3">
        <h2 class="text-sm font-medium">Keyboard shortcuts</h2>

        <div
          v-for="group in groups"
          :key="group.name"
          class="border-border/70 overflow-hidden rounded-xl border"
        >
          <div
            class="bg-muted/40 text-muted-foreground px-4 py-2 text-xs font-medium tracking-wide uppercase"
          >
            {{ group.name }}
          </div>

          <ul class="divide-y">
            <li
              v-for="item in group.items"
              :key="item.id"
              class="flex items-center justify-between gap-4 px-4 py-2.5 text-sm"
            >
              <span>{{ item.label }}</span>
              <kbd
                class="bg-muted rounded border px-2 py-0.5 font-mono text-[11px]"
              >
                {{ item.keys }}
              </kbd>
            </li>
          </ul>
        </div>
      </section>
    </div>
  </div>
</template>

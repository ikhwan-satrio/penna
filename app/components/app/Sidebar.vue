<script setup lang="ts">
import {
  Feather,
  FolderOpen,
  Plus,
  RefreshCw,
  Search,
  Settings,
} from "@lucide/vue"
import type { FileEntry } from "~/types/vault"

const tabsStore = useTabsStore()
const { vaultPath, vaultName, fileTree, loading, error, noteCount } = useVault()
const { openVault, refreshVault, openNote, newNote, openSettings } =
  useNoteActions()

const search = ref("")

const filteredTree = computed(() => filterTree(fileTree.value, search.value))

function filterTree(entries: FileEntry[], query: string): FileEntry[] {
  const needle = query.trim().toLowerCase()
  if (!needle) return entries

  return entries.flatMap((entry) => {
    if (entry.is_dir) {
      const children = filterTree(entry.children ?? [], needle)
      if (children.length || entry.name.toLowerCase().includes(needle)) {
        return [{ ...entry, children }]
      }
      return []
    }

    return entry.name.toLowerCase().includes(needle) ? [entry] : []
  })
}

function onOpen(entry: FileEntry) {
  void openNote(entry)
}
</script>

<template>
  <UiSidebar collapsible="icon">
    <UiSidebarHeader>
      <UiSidebarMenu>
        <UiSidebarMenuItem>
          <UiSidebarMenuButton
            size="lg"
            tooltip="Open vault"
            @click="openVault"
          >
            <div
              class="bg-primary text-primary-foreground flex aspect-square size-8 shrink-0 items-center justify-center rounded-lg"
            >
              <Feather class="size-4" />
            </div>
            <div
              class="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden"
            >
              <span class="truncate font-semibold">penna</span>
              <span class="text-muted-foreground truncate text-xs">
                {{ vaultName ?? "No vault open" }}
              </span>
            </div>
            <FolderOpen
              class="ml-auto size-4 group-data-[collapsible=icon]:hidden"
            />
          </UiSidebarMenuButton>
        </UiSidebarMenuItem>
      </UiSidebarMenu>

      <div class="group-data-[collapsible=icon]:hidden">
        <div class="relative">
          <Search
            class="text-muted-foreground pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2"
          />
          <UiInput
            v-model="search"
            placeholder="Search notes..."
            class="h-8 pl-8"
            :disabled="!vaultPath"
          />
        </div>
      </div>
    </UiSidebarHeader>

    <UiSidebarSeparator />

    <UiSidebarContent>
      <UiSidebarGroup>
        <UiSidebarGroupLabel class="justify-between">
          <span>Notes</span>
          <span
            v-if="vaultPath"
            class="text-muted-foreground/80 font-normal tabular-nums group-data-[collapsible=icon]:hidden"
          >
            {{ noteCount }}
          </span>
        </UiSidebarGroupLabel>

        <UiSidebarGroupContent>
          <AppFileTree
            v-if="filteredTree.length"
            :entries="filteredTree"
            @open="onOpen"
          />

          <div
            v-else-if="loading"
            class="space-y-2 px-2 py-1 group-data-[collapsible=icon]:hidden"
          >
            <div
              v-for="index in 5"
              :key="index"
              class="bg-sidebar-accent h-6 animate-pulse rounded-md"
            />
          </div>

          <p
            v-else
            class="text-muted-foreground px-2 py-6 text-center text-xs group-data-[collapsible=icon]:hidden"
          >
            {{
              vaultPath
                ? search
                  ? "No notes match your search."
                  : "This vault is empty."
                : "Open a vault to start writing."
            }}
          </p>
        </UiSidebarGroupContent>
      </UiSidebarGroup>
    </UiSidebarContent>

    <UiSidebarFooter>
      <UiSidebarMenu>
        <UiSidebarMenuItem>
          <UiSidebarMenuButton tooltip="New note" @click="newNote">
            <Plus />
            <span>New note</span>
          </UiSidebarMenuButton>
        </UiSidebarMenuItem>
        <UiSidebarMenuItem>
          <UiSidebarMenuButton tooltip="Open vault" @click="openVault">
            <FolderOpen />
            <span>Open vault</span>
          </UiSidebarMenuButton>
        </UiSidebarMenuItem>
        <UiSidebarMenuItem>
          <UiSidebarMenuButton
            tooltip="Refresh vault"
            :disabled="!vaultPath || loading"
            @click="refreshVault"
          >
            <RefreshCw :class="{ 'animate-spin': loading }" />
            <span>Refresh</span>
          </UiSidebarMenuButton>
        </UiSidebarMenuItem>
        <UiSidebarMenuItem>
          <UiSidebarMenuButton tooltip="Settings" @click="openSettings">
            <Settings />
            <span>Settings</span>
          </UiSidebarMenuButton>
        </UiSidebarMenuItem>
      </UiSidebarMenu>

      <p
        v-if="error"
        class="text-destructive px-2 text-xs group-data-[collapsible=icon]:hidden"
      >
        {{ error }}
      </p>
      <p
        v-else-if="vaultPath"
        class="text-muted-foreground px-2 text-xs group-data-[collapsible=icon]:hidden"
      >
        {{ noteCount }} {{ noteCount === 1 ? "note" : "notes" }}
      </p>
    </UiSidebarFooter>

    <UiSidebarRail />
  </UiSidebar>
</template>

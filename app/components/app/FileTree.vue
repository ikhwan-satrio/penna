<script setup lang="ts">
import { resolveComponent } from "vue"
import { ChevronRight, FileText, Folder } from "@lucide/vue"
import type { FileEntry } from "~/types/vault"

defineOptions({ name: "AppFileTree" })

withDefaults(
  defineProps<{
    entries: FileEntry[]
    nested?: boolean
  }>(),
  {
    nested: false,
  },
)

const emit = defineEmits<{
  open: [entry: FileEntry]
}>()

const tabsStore = useTabsStore()

const SidebarMenu = resolveComponent("UiSidebarMenu")
const SidebarMenuItem = resolveComponent("UiSidebarMenuItem")
const SidebarMenuSub = resolveComponent("UiSidebarMenuSub")
const SidebarMenuSubItem = resolveComponent("UiSidebarMenuSubItem")
</script>

<template>
  <component :is="nested ? SidebarMenuSub : SidebarMenu">
    <component
      :is="nested ? SidebarMenuSubItem : SidebarMenuItem"
      v-for="entry in entries"
      :key="entry.path"
    >
      <UiCollapsible v-if="entry.is_dir" :default-open="true">
        <UiCollapsibleTrigger as-child>
          <UiSidebarMenuButton
            :tooltip="entry.name"
            class="[&[data-state=open]>svg]:rotate-90"
          >
            <ChevronRight class="transition-transform" />
            <Folder />
            <span class="truncate">{{ entry.name }}</span>
          </UiSidebarMenuButton>
        </UiCollapsibleTrigger>

        <UiCollapsibleContent>
          <AppFileTree
            :entries="entry.children ?? []"
            nested
            @open="emit('open', $event)"
          />
        </UiCollapsibleContent>
      </UiCollapsible>

      <UiSidebarMenuButton
        v-else
        :is-active="tabsStore.activeTabId === entry.path"
        :tooltip="entry.name"
        @click="emit('open', entry)"
      >
        <FileText />
        <span class="truncate">{{ entry.name }}</span>
      </UiSidebarMenuButton>
    </component>
  </component>
</template>

<script setup lang="ts">
import { HotkeysProvider } from "@tanstack/vue-hotkeys"
import { Toaster } from "@/components/ui/sonner"
import { appHotkeys } from "~/lib/hotkeys"
</script>

<template>
  <HotkeysProvider :app-hotkeys="appHotkeys">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <AppSearchDialog />
  </HotkeysProvider>

  <Toaster />
  <NuxtRouteAnnouncer />
  <AppConfirmDialog />
</template>

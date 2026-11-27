<script setup lang="ts">
const { refresh } = useVault()

useGlobalHotkeys()

onMounted(refresh)
</script>

<template>
  <UiSidebarProvider class="h-svh w-full overflow-hidden">
    <AppSidebar />

    <UiSidebarInset class="flex h-svh min-h-0 min-w-0 flex-col overflow-hidden">
      <AppTitleBar />

      <main class="flex min-h-0 flex-1 flex-col overflow-hidden">
        <slot />
      </main>
    </UiSidebarInset>
  </UiSidebarProvider>
</template>

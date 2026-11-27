<script setup lang="ts">
defineProps<{
  content: string
}>()
</script>

<template>
  <UiScrollArea class="h-full">
    <div class="mx-auto max-w-3xl p-6">
      <MDC
        :value="content"
        tag="article"
        class="prose prose-sm dark:prose-invert prose-headings:tracking-tight prose-a:text-primary prose-a:underline-offset-4 max-w-none"
      />
    </div>
  </UiScrollArea>
</template>

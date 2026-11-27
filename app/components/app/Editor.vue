<script setup lang="ts">
const model = defineModel<string>({ required: true })

withDefaults(
  defineProps<{
    placeholder?: string
  }>(),
  {
    placeholder: "Start writing...",
  },
)
</script>

<template>
  <textarea
    v-model="model"
    spellcheck="false"
    :placeholder="placeholder"
    class="placeholder:text-muted-foreground h-full w-full resize-none overflow-y-auto bg-transparent p-6 font-mono text-sm leading-6 outline-none"
  />
</template>

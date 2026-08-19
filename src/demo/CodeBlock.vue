<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ code: string; lang?: string }>()

const copied = ref(false)

async function copy(code: string) {
  try {
    await navigator.clipboard.writeText(code)
    copied.value = true
    window.setTimeout(() => (copied.value = false), 1500)
  } catch {
    /* clipboard unavailable */
  }
}
</script>

<template>
  <div class="group relative min-w-0 max-w-full">
    <button
      type="button"
      class="absolute right-2 top-2 z-10 rounded-md border border-gray-700 bg-gray-800/80 px-2 py-1 text-xs text-gray-200 opacity-0 transition group-hover:opacity-100 hover:bg-gray-700"
      @click="copy(code)"
    >
      {{ copied ? 'Copié ✓' : 'Copier' }}
    </button>
    <pre
      class="max-w-full overflow-x-auto rounded-lg border border-gray-800 bg-gray-900 p-4 text-sm leading-relaxed text-gray-100"
    ><code :data-lang="lang">{{ code }}</code></pre>
  </div>
</template>

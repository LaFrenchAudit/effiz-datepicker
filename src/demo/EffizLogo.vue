<script setup lang="ts">
// Brand mark: an amber calendar outline (the "liseret" around a datepicker)
// with the Effiz green sigma as its content. Stroke-only so it scales down to a
// favicon and works on light/dark. Self-contained SVG, no external assets.
withDefaults(defineProps<{ size?: number }>(), { size: 30 })
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 48 48"
    fill="none"
    role="img"
    aria-label="Effiz"
    xmlns="http://www.w3.org/2000/svg"
  >
    <!-- Datepicker outline (amber liseret) -->
    <rect x="6.5" y="10.5" width="35" height="31" rx="5.5" stroke="#F2A81D" stroke-width="3" />
    <!-- Hanging tabs -->
    <path d="M17 6.5 V13" stroke="#F2A81D" stroke-width="3" stroke-linecap="round" />
    <path d="M31 6.5 V13" stroke="#F2A81D" stroke-width="3" stroke-linecap="round" />
    <!-- Header separator -->
    <path d="M6.5 19.5 H41.5" stroke="#F2A81D" stroke-width="2.6" />

    <!-- Green sigma (the "content" of the datepicker) -->
    <path
      d="M16.5 24.5 L23.5 30.5 L16.5 36.5"
      stroke="#3E9E6E"
      stroke-width="3.4"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path d="M16.5 24.5 H31" stroke="#74E0A3" stroke-width="3.4" stroke-linecap="round" />
    <path d="M16.5 36.5 H31" stroke="#74E0A3" stroke-width="3.4" stroke-linecap="round" />
    <path d="M16.5 30.5 H26" stroke="#74E0A3" stroke-width="3.4" stroke-linecap="round" />
    <path d="M25.5 27.4 L30.5 30.5 L25.5 33.6 Z" fill="#74E0A3" />
  </svg>
</template>

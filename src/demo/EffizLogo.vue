<script setup lang="ts">
// Small brand mark: a two-tone green sigma inside an amber ring, echoing the
// Effiz logo. Self-contained SVG, no external assets.
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
    <!-- Amber ring -->
    <circle cx="24" cy="24" r="20" stroke="#F2A81D" stroke-width="3.4" />

    <!-- Darker green diagonal (depth), sits behind the mint bars -->
    <path
      d="M16 14 L25 24 L16 34"
      stroke="#3E9E6E"
      stroke-width="5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />

    <!-- Mint sigma bars -->
    <path d="M16 14 H33" stroke="#74E0A3" stroke-width="5" stroke-linecap="round" />
    <path d="M16 34 H33" stroke="#74E0A3" stroke-width="5" stroke-linecap="round" />
    <path d="M16 24 H27.5" stroke="#74E0A3" stroke-width="5" stroke-linecap="round" />

    <!-- Arrow tip on the middle bar -->
    <path d="M27 19.5 L33.5 24 L27 28.5 Z" fill="#74E0A3" />
  </svg>
</template>

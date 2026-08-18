<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    label: string
    /** Selected endpoint, or the single selected value. */
    selected?: boolean
    /** Strictly between the two range endpoints (not an endpoint itself). */
    inRange?: boolean
    /** Selected start that connects to an end on its right. */
    rangeStart?: boolean
    /** Selected end that connects to a start on its left. */
    rangeEnd?: boolean
    today?: boolean
    /** Dimmed (days from an adjacent month, years outside the decade). */
    muted?: boolean
    disabled?: boolean
    /** `day` cells are square; `wide` cells (months/years) are rectangular. */
    variant?: 'day' | 'wide'
    ariaLabel?: string
    tabbable?: boolean
    dataKey?: string
  }>(),
  {
    selected: false,
    inRange: false,
    rangeStart: false,
    rangeEnd: false,
    today: false,
    muted: false,
    disabled: false,
    variant: 'day',
    ariaLabel: undefined,
    tabbable: false,
    dataKey: undefined,
  },
)

defineEmits<{
  (e: 'select'): void
  (e: 'hover'): void
}>()

// The wrapper carries the continuous (light) range band; the button carries the
// selected pill. Endpoints round only their outer corners so the primary pill
// flows straight into the neighbouring light band.
const wrapClass = computed(() => ({
  'effiz-dp__cellwrap': true,
  'is-in-range': props.inRange && !props.selected,
}))

const buttonClass = computed(() => ({
  'effiz-dp__cell': true,
  [`effiz-dp__cell--${props.variant}`]: true,
  'is-selected': props.selected,
  'is-range-start': props.rangeStart,
  'is-range-end': props.rangeEnd,
  'is-today': props.today,
  'is-muted': props.muted,
  'is-disabled': props.disabled,
}))
</script>

<template>
  <div :class="wrapClass">
    <button
      type="button"
      :class="buttonClass"
      :disabled="disabled"
      :aria-label="ariaLabel"
      :aria-pressed="selected"
      :aria-current="today ? 'date' : undefined"
      :tabindex="tabbable ? 0 : -1"
      :data-key="dataKey"
      @click="$emit('select')"
      @mouseenter="$emit('hover')"
      @focus="$emit('hover')"
    >
      {{ label }}
    </button>
  </div>
</template>

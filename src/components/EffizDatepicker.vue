<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import './datepicker.css'
import EffizCalendar from './EffizCalendar.vue'
import type { DateInput, DatepickerModel, DatepickerType, DisabledDateFn } from '../types'
import { formatValue, toDate } from '../utils/date'

const props = withDefaults(
  defineProps<{
    modelValue?: DatepickerModel
    type?: DatepickerType
    range?: boolean
    min?: DateInput
    max?: DateInput
    disabledDate?: DisabledDateFn
    locale?: string
    firstDayOfWeek?: number
    monthFormat?: 'short' | 'long'
    weekdayFormat?: 'short' | 'narrow' | 'long'
    /** Render the calendar inline (no input, no popover). */
    inline?: boolean
    showFooter?: boolean
    showToday?: boolean
    showClear?: boolean
    todayLabel?: string
    clearLabel?: string
    /** Input-specific options. */
    placeholder?: string
    disabled?: boolean
    /** Show a clear (×) button in the input when a value is set. */
    clearable?: boolean
    /** Custom per-date display formatter. */
    format?: (date: Date, type: DatepickerType) => string
    /** Separator between the two dates of a range, in the input. */
    separator?: string
    /** Close the popover after a (complete) selection. */
    closeOnSelect?: boolean
    /** Override the primary/tint color for this instance (any CSS color). */
    primaryColor?: string
    /** Force the dark theme regardless of the surrounding `.dark` class. */
    dark?: boolean
    id?: string
    name?: string
    inputClass?: string
  }>(),
  {
    modelValue: null,
    type: 'date',
    range: false,
    min: undefined,
    max: undefined,
    disabledDate: undefined,
    locale: undefined,
    firstDayOfWeek: 1,
    monthFormat: 'short',
    weekdayFormat: 'short',
    inline: false,
    showFooter: true,
    showToday: true,
    showClear: true,
    todayLabel: "Aujourd'hui",
    clearLabel: 'Effacer',
    placeholder: '',
    disabled: false,
    clearable: true,
    format: undefined,
    separator: ' – ',
    closeOnSelect: true,
    primaryColor: undefined,
    dark: false,
    id: undefined,
    name: undefined,
    inputClass: undefined,
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: DatepickerModel): void
  (e: 'change', value: DatepickerModel): void
  (e: 'open'): void
  (e: 'close'): void
  (e: 'clear'): void
}>()

const open = ref(false)
const rootRef = ref<HTMLElement | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)
const dropdownRef = ref<HTMLElement | null>(null)
const calendarRef = ref<InstanceType<typeof EffizCalendar> | null>(null)
const dropdownStyle = ref<Record<string, string>>({})

// The dropdown is promoted to the browser top layer via the Popover API so it
// is never clipped by (nor hidden behind) an ancestor — including a modal
// <dialog> or an overflow:hidden container. Falls back to fixed positioning
// when the Popover API is unavailable.
const supportsPopover =
  typeof HTMLElement !== 'undefined' && typeof HTMLElement.prototype.showPopover === 'function'

// ------------------------------------------------------------- Display value

function fmt(date: Date | null): string {
  if (!date) return ''
  return props.format ? props.format(date, props.type) : formatValue(date, props.type, props.locale)
}

const displayValue = computed(() => {
  if (props.range) {
    const value = props.modelValue
    const [start, end] = Array.isArray(value)
      ? [toDate(value[0]), toDate(value[1])]
      : [null, null]
    if (!start && !end) return ''
    return `${fmt(start)}${props.separator}${fmt(end)}`
  }
  return fmt(toDate(props.modelValue as DateInput))
})

const hasValue = computed(() => {
  if (props.range) {
    const value = props.modelValue
    return Array.isArray(value) && (value[0] != null || value[1] != null)
  }
  return props.modelValue != null
})

const rootStyle = computed(() =>
  props.primaryColor ? { '--effiz-dp-primary': props.primaryColor } : undefined,
)

// ------------------------------------------------------------- Popover logic

function openPopover() {
  if (props.disabled || open.value) return
  open.value = true
  emit('open')
  document.addEventListener('mousedown', onDocumentPointer, true)
  window.addEventListener('scroll', updatePlacement, true)
  window.addEventListener('resize', updatePlacement)
  void nextTick(() => {
    const dd = dropdownRef.value
    if (dd && supportsPopover && !dd.matches(':popover-open')) {
      try {
        dd.showPopover()
      } catch {
        /* already shown / unsupported */
      }
    }
    updatePlacement()
    calendarRef.value?.focusActiveCell()
  })
}

function closePopover(focusInput = false) {
  if (!open.value) return
  const dd = dropdownRef.value
  if (dd && supportsPopover && dd.matches(':popover-open')) {
    try {
      dd.hidePopover()
    } catch {
      /* already hidden */
    }
  }
  open.value = false
  emit('close')
  document.removeEventListener('mousedown', onDocumentPointer, true)
  window.removeEventListener('scroll', updatePlacement, true)
  window.removeEventListener('resize', updatePlacement)
  if (focusInput) inputRef.value?.focus()
}

function togglePopover() {
  open.value ? closePopover() : openPopover()
}

// Position the (top-layer) dropdown under the input, flipping up when there is
// not enough room below, and clamped inside the viewport.
function updatePlacement() {
  const control = rootRef.value
  const dropdown = dropdownRef.value
  if (!control || !dropdown) return
  const rect = control.getBoundingClientRect()
  const gap = 8
  const ddHeight = dropdown.offsetHeight || 360
  const ddWidth = dropdown.offsetWidth || rect.width
  const spaceBelow = window.innerHeight - rect.bottom
  const flipUp = spaceBelow < ddHeight + gap && rect.top > ddHeight + gap
  const top = flipUp ? rect.top - ddHeight - gap : rect.bottom + gap
  let left = rect.left
  const maxLeft = window.innerWidth - ddWidth - 8
  if (left > maxLeft) left = Math.max(8, maxLeft)
  if (left < 8) left = 8
  dropdownStyle.value = {
    position: 'fixed',
    inset: 'auto',
    top: `${Math.round(top)}px`,
    left: `${Math.round(left)}px`,
    margin: '0',
  }
}

function onDocumentPointer(event: MouseEvent) {
  if (rootRef.value && !rootRef.value.contains(event.target as Node)) {
    closePopover()
  }
}

function onInputKeydown(event: KeyboardEvent) {
  if (props.disabled) return
  if (event.key === 'Escape') {
    closePopover(true)
    return
  }
  if (!open.value && (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown')) {
    event.preventDefault()
    openPopover()
  }
}

function onPanelKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.stopPropagation()
    closePopover(true)
  }
}

// --------------------------------------------------------- Calendar bridging

function onCalendarUpdate(value: DatepickerModel) {
  emit('update:modelValue', value)
}

function onCalendarChange(value: DatepickerModel) {
  emit('change', value)
}

function onCalendarSelect() {
  if (props.closeOnSelect) closePopover(true)
}

function onRangeComplete() {
  if (props.closeOnSelect) closePopover(true)
}

function clearValue() {
  const empty: DatepickerModel = props.range ? [null, null] : null
  emit('update:modelValue', empty)
  emit('change', empty)
  emit('clear')
}

watch(
  () => props.disabled,
  (isDisabled) => {
    if (isDisabled) closePopover()
  },
)

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', onDocumentPointer, true)
  window.removeEventListener('scroll', updatePlacement, true)
  window.removeEventListener('resize', updatePlacement)
})

// Shared calendar props forwarded to <EffizCalendar>.
const calendarProps = computed(() => ({
  type: props.type,
  range: props.range,
  min: props.min,
  max: props.max,
  disabledDate: props.disabledDate,
  locale: props.locale,
  firstDayOfWeek: props.firstDayOfWeek,
  monthFormat: props.monthFormat,
  weekdayFormat: props.weekdayFormat,
  showFooter: props.showFooter,
  showToday: props.showToday,
  showClear: props.showClear,
  todayLabel: props.todayLabel,
  clearLabel: props.clearLabel,
}))

defineExpose({ open: openPopover, close: closePopover, toggle: togglePopover })
</script>

<template>
  <!-- Inline mode: just the calendar, themed. -->
  <div
    v-if="inline"
    ref="rootRef"
    class="effiz-dp"
    :class="{ 'effiz-dp--dark': dark }"
    :style="rootStyle"
  >
    <EffizCalendar
      ref="calendarRef"
      :model-value="modelValue"
      v-bind="calendarProps"
      inline
      @update:model-value="onCalendarUpdate"
      @change="onCalendarChange"
    />
  </div>

  <!-- Default mode: input + popover. -->
  <div
    v-else
    ref="rootRef"
    class="effiz-dp effiz-dp__control"
    :class="{ 'effiz-dp--dark': dark }"
    :style="rootStyle"
  >
    <div class="effiz-dp__input-wrap">
      <span class="effiz-dp__leading-icon" aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path
            d="M8 2v3M16 2v3M3.5 9h17M5 4.5h14A1.5 1.5 0 0 1 20.5 6v13A1.5 1.5 0 0 1 19 20.5H5A1.5 1.5 0 0 1 3.5 19V6A1.5 1.5 0 0 1 5 4.5Z"
            stroke="currentColor"
            stroke-width="1.6"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </span>

      <input
        :id="id"
        ref="inputRef"
        type="text"
        readonly
        role="combobox"
        aria-haspopup="dialog"
        :aria-expanded="open"
        :name="name"
        :class="['effiz-dp__input', inputClass]"
        :value="displayValue"
        :placeholder="placeholder"
        :disabled="disabled"
        @click="togglePopover"
        @keydown="onInputKeydown"
      />

      <button
        v-if="clearable && hasValue && !disabled"
        type="button"
        class="effiz-dp__clear"
        aria-label="Effacer la sélection"
        @click.stop="clearValue"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M6 6l12 12M18 6L6 18"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
      </button>
    </div>

    <div
      v-if="open"
      ref="dropdownRef"
      class="effiz-dp__dropdown"
      :popover="supportsPopover ? 'manual' : undefined"
      :style="dropdownStyle"
      role="dialog"
      aria-modal="false"
      @keydown="onPanelKeydown"
    >
      <EffizCalendar
        ref="calendarRef"
        :model-value="modelValue"
        v-bind="calendarProps"
        @update:model-value="onCalendarUpdate"
        @change="onCalendarChange"
        @select="onCalendarSelect"
        @range-complete="onRangeComplete"
      />
    </div>
  </div>
</template>

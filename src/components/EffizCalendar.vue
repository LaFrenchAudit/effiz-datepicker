<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import './datepicker.css'
import GridCell from './GridCell.vue'
import type {
  CalendarView,
  DateInput,
  DatepickerModel,
  DatepickerType,
  DisabledDateFn,
  RangeValue,
} from '../types'
import {
  SELECTION_VIEW,
  VIEW_ORDER,
  addDays,
  addMonths,
  addYears,
  compareByType,
  decadeStart,
  getMonthLabels,
  getMonthMatrix,
  getMonthsOfYear,
  getWeekdayLabels,
  getYearsOfDecade,
  isSameDay,
  isSameMonth,
  isSameUnit,
  isSameYear,
  normalizeToType,
  startOfDay,
  startOfMonth,
  startOfYear,
  toDate,
  unitBounds,
  viewIndex,
} from '../utils/date'

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
    inline?: boolean
    showFooter?: boolean
    showToday?: boolean
    showClear?: boolean
    todayLabel?: string
    clearLabel?: string
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
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: DatepickerModel): void
  (e: 'change', value: DatepickerModel): void
  (e: 'select', value: DatepickerModel): void
  (e: 'range-complete', value: RangeValue): void
}>()

const today = startOfDay(new Date())

const selectionView = computed<CalendarView>(() => SELECTION_VIEW[props.type])
const minIndex = computed(() => viewIndex(selectionView.value))

// -------------------------------------------------------------- Value access

function asSingle(): Date | null {
  return toDate(props.modelValue as DateInput)
}

function asRange(): RangeValue {
  const value = props.modelValue
  if (Array.isArray(value)) return [toDate(value[0]), toDate(value[1])]
  return [null, null]
}

const chosen = computed<Date[]>(() => {
  if (props.range) return asRange().filter((d): d is Date => d != null)
  const single = asSingle()
  return single ? [single] : []
})

// ---------------------------------------------------------------- View state

const view = ref<CalendarView>(selectionView.value)
const panelDate = ref<Date>(initialPanelDate())
const hoverDate = ref<Date | null>(null)
const focusDate = ref<Date>(chosen.value[0] ?? today)
const rootRef = ref<HTMLElement | null>(null)

function initialPanelDate(): Date {
  const base = (props.range ? asRange().find(Boolean) : asSingle()) ?? today
  return startOfMonth(base)
}

// Keep the panel in sync when the value is replaced from outside, but do not
// yank the view while the user is navigating / picking a range on screen.
watch(
  () => props.modelValue,
  () => {
    const base = chosen.value[0]
    if (!base) return
    if (chosen.value.some(isInVisibleGrid)) return
    panelDate.value = startOfMonth(base)
    focusDate.value = base
  },
)

watch(
  () => props.type,
  () => {
    view.value = selectionView.value
  },
)

// ------------------------------------------------------------------- Columns

const columns = computed(() => (view.value === 'days' ? 7 : 3))

// ------------------------------------------------------------ Grid contents

const weekdayLabels = computed(() =>
  getWeekdayLabels(props.locale, props.firstDayOfWeek, props.weekdayFormat),
)
const monthLabels = computed(() => getMonthLabels(props.locale, props.monthFormat))

const weeks = computed(() => getMonthMatrix(panelDate.value, props.firstDayOfWeek))
const months = computed(() => getMonthsOfYear(panelDate.value))
const years = computed(() => getYearsOfDecade(panelDate.value))

// --------------------------------------------------------------- Header text

const headerTitle = computed(() => {
  if (view.value === 'days') {
    return new Intl.DateTimeFormat(props.locale, { month: 'long', year: 'numeric' }).format(
      panelDate.value,
    )
  }
  if (view.value === 'months') {
    return new Intl.DateTimeFormat(props.locale, { year: 'numeric' }).format(panelDate.value)
  }
  const start = decadeStart(panelDate.value.getFullYear())
  return `${start} – ${start + 9}`
})

const titleDisabled = computed(() => view.value === 'years')

// --------------------------------------------------------- Range preview

const previewRange = computed<RangeValue>(() => {
  if (!props.range) return [null, null]
  const [start, end] = asRange()
  if (start && !end && hoverDate.value) {
    const hovered = normalizeToType(hoverDate.value, props.type)
    return compareByType(hovered, start, props.type) < 0 ? [hovered, start] : [start, hovered]
  }
  return [start, end]
})

// ------------------------------------------------------------ Cell state

interface CellState {
  selected: boolean
  rangeStart: boolean
  rangeEnd: boolean
  inRange: boolean
}

const EMPTY_STATE: CellState = {
  selected: false,
  rangeStart: false,
  rangeEnd: false,
  inRange: false,
}

/** Full selection state, used only at the selection (min) view. */
function selectionState(unit: Date): CellState {
  const type = props.type
  if (!props.range) {
    const single = asSingle()
    return {
      ...EMPTY_STATE,
      selected: !!single && compareByType(unit, single, type) === 0,
    }
  }

  const [start, end] = previewRange.value
  const isStart = !!start && compareByType(unit, start, type) === 0
  const isEnd = !!end && compareByType(unit, end, type) === 0
  const distinct = !!start && !!end && compareByType(start, end, type) !== 0
  const inRange =
    !!start &&
    !!end &&
    compareByType(unit, start, type) > 0 &&
    compareByType(unit, end, type) < 0

  return {
    selected: isStart || isEnd,
    rangeStart: distinct && isStart,
    rangeEnd: distinct && isEnd,
    inRange,
  }
}

/** Soft "contains a selection" state, used at navigation (non-min) views. */
function navSelected(unit: Date, cellView: CalendarView): boolean {
  return chosen.value.some((d) => isSameUnit(unit, d, cellView))
}

function isTodayCell(unit: Date, cellView: CalendarView): boolean {
  if (cellView === 'days') return isSameDay(unit, today)
  if (cellView === 'months') return isSameMonth(unit, today)
  return isSameYear(unit, today)
}

function isSelectionDisabled(unit: Date): boolean {
  const min = toDate(props.min)
  const max = toDate(props.max)
  if (min && compareByType(unit, min, props.type) < 0) return true
  if (max && compareByType(unit, max, props.type) > 0) return true
  if (props.disabledDate && props.disabledDate(normalizeToType(unit, props.type), props.type)) {
    return true
  }
  return false
}

function isNavDisabled(unit: Date, cellView: CalendarView): boolean {
  const min = toDate(props.min)
  const max = toDate(props.max)
  const [lo, hi] = unitBounds(unit, cellView)
  if (min && hi.getTime() < min.getTime()) return true
  if (max && lo.getTime() > max.getTime()) return true
  return false
}

// ------------------------------------------------------------ Keyboard focus

function keyFor(date: Date, cellView: CalendarView): string {
  if (cellView === 'days') return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
  if (cellView === 'months') return `${date.getFullYear()}-${date.getMonth()}`
  return `${date.getFullYear()}`
}

function isInVisibleGrid(date: Date): boolean {
  if (view.value === 'days') {
    const grid = weeks.value
    const first = grid[0][0].getTime()
    const last = grid[grid.length - 1][6].getTime()
    const t = startOfDay(date).getTime()
    return t >= first && t <= last
  }
  if (view.value === 'months') return date.getFullYear() === panelDate.value.getFullYear()
  const start = decadeStart(panelDate.value.getFullYear())
  return date.getFullYear() >= start - 1 && date.getFullYear() <= start + 10
}

const displayFocus = computed<Date>(() => {
  if (isInVisibleGrid(focusDate.value)) return focusDate.value
  if (view.value === 'days') return startOfMonth(panelDate.value)
  if (view.value === 'months') return new Date(panelDate.value.getFullYear(), 0, 1)
  return new Date(decadeStart(panelDate.value.getFullYear()), 0, 1)
})

const activeKey = computed(() => keyFor(displayFocus.value, view.value))

function focusActiveCell() {
  nextTick(() => {
    const el = rootRef.value?.querySelector<HTMLElement>(`[data-key="${activeKey.value}"]`)
    el?.focus()
  })
}

// Expose so the popover wrapper can move focus into the grid on open.
defineExpose({ focusActiveCell })

// -------------------------------------------------------------- Interactions

function onCellClick(date: Date, cellView: CalendarView) {
  const idx = viewIndex(cellView)
  if (idx === minIndex.value) {
    selectUnit(date)
    return
  }
  // Drill one level down towards the selection view.
  panelDate.value = date
  focusDate.value = date
  view.value = VIEW_ORDER[idx - 1]
  focusActiveCell()
}

function selectUnit(date: Date) {
  const value = normalizeToType(date, props.type)
  if (isSelectionDisabled(value)) return
  focusDate.value = value

  if (!props.range) {
    emitValue(value)
    emit('select', value)
    return
  }

  let [start, end] = asRange()
  if (!start || (start && end)) {
    start = value
    end = null
    emitValue([start, end])
    return
  }

  // A start exists and we are picking the end.
  if (compareByType(value, start, props.type) < 0) {
    end = start
    start = value
  } else {
    end = value
  }
  hoverDate.value = null
  emitValue([start, end])
  emit('range-complete', [start, end])
}

function emitValue(value: DatepickerModel) {
  emit('update:modelValue', value)
  emit('change', value)
}

function onCellHover(date: Date) {
  if (props.range) hoverDate.value = date
}

function clearHover() {
  hoverDate.value = null
}

function onTitleClick() {
  const idx = viewIndex(view.value)
  if (idx < VIEW_ORDER.length - 1) {
    view.value = VIEW_ORDER[idx + 1]
    focusActiveCell()
  }
}

function shift(direction: 1 | -1) {
  if (view.value === 'days') panelDate.value = addMonths(panelDate.value, direction)
  else if (view.value === 'months') panelDate.value = addYears(panelDate.value, direction)
  else panelDate.value = addYears(panelDate.value, direction * 10)
}

function selectToday() {
  view.value = selectionView.value
  panelDate.value = startOfMonth(today)
  selectUnit(today)
}

function clear() {
  emitValue(props.range ? [null, null] : null)
}

// ------------------------------------------------------------ Keyboard grid

function step(date: Date, delta: number): Date {
  if (view.value === 'days') return addDays(date, delta)
  if (view.value === 'months') return addMonths(date, delta)
  return addYears(date, delta)
}

function pageStep(date: Date, direction: 1 | -1): Date {
  if (view.value === 'days') return addMonths(date, direction)
  if (view.value === 'months') return addYears(date, direction)
  return addYears(date, direction * 10)
}

function moveFocus(date: Date) {
  focusDate.value = date
  if (view.value === 'days') panelDate.value = startOfMonth(date)
  else if (view.value === 'months') panelDate.value = startOfYear(date)
  else panelDate.value = new Date(decadeStart(date.getFullYear()), 0, 1)
  focusActiveCell()
}

function onGridKeydown(event: KeyboardEvent) {
  const base = displayFocus.value
  const cols = columns.value
  let next: Date | null = null

  switch (event.key) {
    case 'ArrowLeft':
      next = step(base, -1)
      break
    case 'ArrowRight':
      next = step(base, 1)
      break
    case 'ArrowUp':
      next = step(base, -cols)
      break
    case 'ArrowDown':
      next = step(base, cols)
      break
    case 'PageUp':
      next = pageStep(base, -1)
      break
    case 'PageDown':
      next = pageStep(base, 1)
      break
    case 'Enter':
    case ' ':
      event.preventDefault()
      onCellClick(base, view.value)
      return
    default:
      return
  }

  if (next) {
    event.preventDefault()
    moveFocus(next)
  }
}

// --------------------------------------------------------------- Cell props

function dayAria(date: Date): string {
  return new Intl.DateTimeFormat(props.locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

function monthAria(date: Date): string {
  return new Intl.DateTimeFormat(props.locale, { month: 'long', year: 'numeric' }).format(date)
}
</script>

<template>
  <div
    ref="rootRef"
    class="effiz-dp__panel"
    :class="{ 'effiz-dp__panel--inline': inline }"
    @mouseleave="clearHover"
  >
    <!-- Header -->
    <div class="effiz-dp__header">
      <button
        type="button"
        class="effiz-dp__nav-btn"
        :aria-label="'Précédent'"
        @click="shift(-1)"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M15 19l-7-7 7-7"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>

      <button
        type="button"
        class="effiz-dp__title"
        :disabled="titleDisabled"
        @click="onTitleClick"
      >
        {{ headerTitle }}
      </button>

      <button type="button" class="effiz-dp__nav-btn" :aria-label="'Suivant'" @click="shift(1)">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M9 5l7 7-7 7"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </div>

    <!-- Days view -->
    <template v-if="view === 'days'">
      <div class="effiz-dp__weekdays" aria-hidden="true">
        <div v-for="label in weekdayLabels" :key="label" class="effiz-dp__weekday">
          {{ label }}
        </div>
      </div>
      <div class="effiz-dp__grid effiz-dp__grid--days" role="grid" @keydown="onGridKeydown">
        <template v-for="(week, wi) in weeks" :key="wi">
          <GridCell
            v-for="day in week"
            :key="keyFor(day, 'days')"
            variant="day"
            :label="String(day.getDate())"
            :muted="day.getMonth() !== panelDate.getMonth()"
            :today="isTodayCell(day, 'days')"
            :disabled="isSelectionDisabled(day)"
            v-bind="minIndex === 0 ? selectionState(day) : { selected: navSelected(day, 'days') }"
            :tabbable="activeKey === keyFor(day, 'days')"
            :data-key="keyFor(day, 'days')"
            :aria-label="dayAria(day)"
            @select="onCellClick(day, 'days')"
            @hover="onCellHover(day)"
          />
        </template>
      </div>
    </template>

    <!-- Months view -->
    <div
      v-else-if="view === 'months'"
      class="effiz-dp__grid effiz-dp__grid--wide"
      role="grid"
      @keydown="onGridKeydown"
    >
      <GridCell
        v-for="month in months"
        :key="keyFor(month, 'months')"
        variant="wide"
        :label="monthLabels[month.getMonth()]"
        :today="isTodayCell(month, 'months')"
        :disabled="minIndex === 1 ? isSelectionDisabled(month) : isNavDisabled(month, 'months')"
        v-bind="minIndex === 1 ? selectionState(month) : { selected: navSelected(month, 'months') }"
        :tabbable="activeKey === keyFor(month, 'months')"
        :data-key="keyFor(month, 'months')"
        :aria-label="monthAria(month)"
        @select="onCellClick(month, 'months')"
        @hover="onCellHover(month)"
      />
    </div>

    <!-- Years view -->
    <div v-else class="effiz-dp__grid effiz-dp__grid--wide" role="grid" @keydown="onGridKeydown">
      <GridCell
        v-for="year in years"
        :key="keyFor(year, 'years')"
        variant="wide"
        :label="String(year.getFullYear())"
        :muted="
          year.getFullYear() < decadeStart(panelDate.getFullYear()) ||
          year.getFullYear() > decadeStart(panelDate.getFullYear()) + 9
        "
        :today="isTodayCell(year, 'years')"
        :disabled="minIndex === 2 ? isSelectionDisabled(year) : isNavDisabled(year, 'years')"
        v-bind="minIndex === 2 ? selectionState(year) : { selected: navSelected(year, 'years') }"
        :tabbable="activeKey === keyFor(year, 'years')"
        :data-key="keyFor(year, 'years')"
        :aria-label="String(year.getFullYear())"
        @select="onCellClick(year, 'years')"
        @hover="onCellHover(year)"
      />
    </div>

    <!-- Footer -->
    <div v-if="showFooter && (showToday || showClear)" class="effiz-dp__footer">
      <button
        v-if="showToday"
        type="button"
        class="effiz-dp__footer-btn effiz-dp__footer-btn--today"
        @click="selectToday"
      >
        {{ todayLabel }}
      </button>
      <button
        v-if="showClear"
        type="button"
        class="effiz-dp__footer-btn effiz-dp__footer-btn--clear"
        @click="clear"
      >
        {{ clearLabel }}
      </button>
    </div>
  </div>
</template>

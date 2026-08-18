import type { CalendarView, DateInput, DatepickerType } from '../types'

/** Map a picker type to the calendar view at which selection happens. */
export const SELECTION_VIEW: Record<DatepickerType, CalendarView> = {
  date: 'days',
  month: 'months',
  year: 'years',
}

/** Ordered views, from most detailed (0) to broadest (2). */
export const VIEW_ORDER: CalendarView[] = ['days', 'months', 'years']

export function viewIndex(view: CalendarView): number {
  return VIEW_ORDER.indexOf(view)
}

/** Coerce any accepted input into a valid `Date`, or `null`. */
export function toDate(value: DateInput): Date | null {
  if (value == null) return null
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : new Date(value.getTime())
  }
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export function isValidDate(value: unknown): value is Date {
  return value instanceof Date && !Number.isNaN(value.getTime())
}

export function startOfDay(date: Date): Date {
  const next = new Date(date)
  next.setHours(0, 0, 0, 0)
  return next
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999)
}

export function startOfYear(date: Date): Date {
  return new Date(date.getFullYear(), 0, 1)
}

export function endOfYear(date: Date): Date {
  return new Date(date.getFullYear(), 11, 31, 23, 59, 59, 999)
}

export function addDays(date: Date, amount: number): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + amount)
  return next
}

export function addMonths(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1)
}

export function addYears(date: Date, amount: number): Date {
  return new Date(date.getFullYear() + amount, date.getMonth(), 1)
}

/** First year of the 10-year block that contains `year` (e.g. 2026 -> 2020). */
export function decadeStart(year: number): number {
  return Math.floor(year / 10) * 10
}

export function isSameDay(a: Date | null, b: Date | null): boolean {
  return (
    !!a &&
    !!b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function isSameMonth(a: Date | null, b: Date | null): boolean {
  return !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
}

export function isSameYear(a: Date | null, b: Date | null): boolean {
  return !!a && !!b && a.getFullYear() === b.getFullYear()
}

/**
 * Normalize a date to the start of the unit selected for a given picker type.
 * `date` -> start of day, `month` -> first of month, `year` -> first of year.
 */
export function normalizeToType(date: Date, type: DatepickerType): Date {
  switch (type) {
    case 'month':
      return startOfMonth(date)
    case 'year':
      return startOfYear(date)
    default:
      return startOfDay(date)
  }
}

/** Compare two dates at the granularity of the given picker type. */
export function compareByType(a: Date, b: Date, type: DatepickerType): number {
  const na = normalizeToType(a, type).getTime()
  const nb = normalizeToType(b, type).getTime()
  return na === nb ? 0 : na < nb ? -1 : 1
}

/** Return `true` if `date` is the same unit as any of the provided dates. */
export function isSameUnit(a: Date | null, b: Date | null, view: CalendarView): boolean {
  switch (view) {
    case 'months':
      return isSameMonth(a, b)
    case 'years':
      return isSameYear(a, b)
    default:
      return isSameDay(a, b)
  }
}

/**
 * The 6x7 matrix of days shown for the month containing `viewDate`.
 * `firstDayOfWeek` is 0 (Sunday) .. 6 (Saturday).
 */
export function getMonthMatrix(viewDate: Date, firstDayOfWeek = 1): Date[][] {
  const first = startOfMonth(viewDate)
  const offset = (first.getDay() - firstDayOfWeek + 7) % 7
  const start = addDays(first, -offset)

  const weeks: Date[][] = []
  let cursor = start
  for (let w = 0; w < 6; w++) {
    const week: Date[] = []
    for (let d = 0; d < 7; d++) {
      week.push(cursor)
      cursor = addDays(cursor, 1)
    }
    weeks.push(week)
  }
  return weeks
}

/** The 12 months of the year containing `viewDate`, as first-of-month dates. */
export function getMonthsOfYear(viewDate: Date): Date[] {
  const year = viewDate.getFullYear()
  return Array.from({ length: 12 }, (_, month) => new Date(year, month, 1))
}

/**
 * The 12 years shown in the "decade" view: the ten years of the decade plus one
 * leading and one trailing year, matching Flowbite's layout.
 */
export function getYearsOfDecade(viewDate: Date): Date[] {
  const start = decadeStart(viewDate.getFullYear())
  return Array.from({ length: 12 }, (_, i) => new Date(start - 1 + i, 0, 1))
}

/** Weekday header labels honoring locale and first-day-of-week. */
export function getWeekdayLabels(
  locale: string | undefined,
  firstDayOfWeek: number,
  format: 'short' | 'narrow' | 'long' = 'short',
): string[] {
  const formatter = new Intl.DateTimeFormat(locale, { weekday: format })
  // 2021-08-01 is a Sunday, giving us a stable reference week.
  const sunday = new Date(2021, 7, 1)
  return Array.from({ length: 7 }, (_, i) =>
    formatter.format(addDays(sunday, (firstDayOfWeek + i) % 7)),
  )
}

/** Localized month labels (Jan..Dec or January..December). */
export function getMonthLabels(
  locale: string | undefined,
  format: 'short' | 'long' = 'short',
): string[] {
  const formatter = new Intl.DateTimeFormat(locale, { month: format })
  return Array.from({ length: 12 }, (_, month) => formatter.format(new Date(2021, month, 1)))
}

/** Human-readable label for a single value, based on the picker type. */
export function formatValue(
  date: Date | null,
  type: DatepickerType,
  locale: string | undefined,
): string {
  if (!date) return ''
  switch (type) {
    case 'month':
      return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(date)
    case 'year':
      return new Intl.DateTimeFormat(locale, { year: 'numeric' }).format(date)
    default:
      return new Intl.DateTimeFormat(locale, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(date)
  }
}

/** Start/end of the unit that `date` belongs to for a given view. */
export function unitBounds(date: Date, view: CalendarView): [Date, Date] {
  switch (view) {
    case 'months':
      return [startOfMonth(date), endOfMonth(date)]
    case 'years':
      return [startOfYear(date), endOfYear(date)]
    default:
      return [startOfDay(date), new Date(startOfDay(date).getTime() + 86_399_999)]
  }
}

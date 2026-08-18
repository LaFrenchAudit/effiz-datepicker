import { describe, expect, it } from 'vitest'
import {
  SELECTION_VIEW,
  VIEW_ORDER,
  addDays,
  addMonths,
  addYears,
  compareByType,
  decadeStart,
  endOfMonth,
  endOfYear,
  formatValue,
  getMonthLabels,
  getMonthMatrix,
  getMonthsOfYear,
  getWeekdayLabels,
  getYearsOfDecade,
  isSameDay,
  isSameMonth,
  isSameUnit,
  isSameYear,
  isValidDate,
  normalizeToType,
  startOfDay,
  startOfMonth,
  startOfYear,
  toDate,
  unitBounds,
  viewIndex,
} from './date'

describe('toDate', () => {
  it('returns null for nullish input', () => {
    expect(toDate(null)).toBeNull()
    expect(toDate(undefined)).toBeNull()
  })

  it('parses strings and numbers', () => {
    expect(toDate('2026-08-18')?.getUTCFullYear()).toBe(2026)
    expect(toDate(0) instanceof Date).toBe(true)
  })

  it('returns null for invalid values', () => {
    expect(toDate('not-a-date')).toBeNull()
    expect(toDate(new Date('invalid'))).toBeNull()
  })

  it('clones Date inputs (no mutation aliasing)', () => {
    const original = new Date(2026, 7, 18)
    const cloned = toDate(original)!
    cloned.setDate(1)
    expect(original.getDate()).toBe(18)
  })
})

describe('isValidDate', () => {
  it('discriminates valid dates', () => {
    expect(isValidDate(new Date(2026, 0, 1))).toBe(true)
    expect(isValidDate(new Date('invalid'))).toBe(false)
    expect(isValidDate('2026')).toBe(false)
    expect(isValidDate(null)).toBe(false)
  })
})

describe('start/end helpers', () => {
  const d = new Date(2026, 7, 18, 13, 45, 30)

  it('startOfDay zeroes the time', () => {
    const s = startOfDay(d)
    expect([s.getHours(), s.getMinutes(), s.getSeconds()]).toEqual([0, 0, 0])
    expect(s.getDate()).toBe(18)
  })

  it('startOfMonth / endOfMonth', () => {
    expect(startOfMonth(d).getDate()).toBe(1)
    expect(endOfMonth(d).getDate()).toBe(31) // August has 31 days
    expect(endOfMonth(new Date(2024, 1, 10)).getDate()).toBe(29) // Feb 2024 leap year
  })

  it('startOfYear / endOfYear', () => {
    expect(startOfYear(d).getMonth()).toBe(0)
    expect(startOfYear(d).getDate()).toBe(1)
    expect(endOfYear(d).getMonth()).toBe(11)
    expect(endOfYear(d).getDate()).toBe(31)
  })
})

describe('arithmetic helpers', () => {
  it('addDays crosses month boundaries', () => {
    expect(addDays(new Date(2026, 7, 30), 3)).toEqual(new Date(2026, 8, 2))
  })

  it('addMonths normalizes to first of month and crosses years', () => {
    expect(addMonths(new Date(2026, 11, 15), 1)).toEqual(new Date(2027, 0, 1))
    expect(addMonths(new Date(2026, 0, 15), -1)).toEqual(new Date(2025, 11, 1))
  })

  it('addYears keeps the month', () => {
    expect(addYears(new Date(2026, 5, 15), 10).getFullYear()).toBe(2036)
    expect(addYears(new Date(2026, 5, 15), 10).getMonth()).toBe(5)
  })
})

describe('decadeStart', () => {
  it('floors to the decade', () => {
    expect(decadeStart(2026)).toBe(2020)
    expect(decadeStart(2020)).toBe(2020)
    expect(decadeStart(2029)).toBe(2020)
    expect(decadeStart(2030)).toBe(2030)
  })
})

describe('same-unit comparisons', () => {
  const a = new Date(2026, 7, 18)
  it('isSameDay', () => {
    expect(isSameDay(a, new Date(2026, 7, 18, 23))).toBe(true)
    expect(isSameDay(a, new Date(2026, 7, 19))).toBe(false)
    expect(isSameDay(a, null)).toBe(false)
  })
  it('isSameMonth', () => {
    expect(isSameMonth(a, new Date(2026, 7, 1))).toBe(true)
    expect(isSameMonth(a, new Date(2026, 8, 18))).toBe(false)
  })
  it('isSameYear', () => {
    expect(isSameYear(a, new Date(2026, 0, 1))).toBe(true)
    expect(isSameYear(a, new Date(2025, 7, 18))).toBe(false)
  })
  it('isSameUnit dispatches on view', () => {
    expect(isSameUnit(a, new Date(2026, 7, 1), 'months')).toBe(true)
    expect(isSameUnit(a, new Date(2026, 0, 1), 'years')).toBe(true)
    expect(isSameUnit(a, new Date(2026, 7, 19), 'days')).toBe(false)
  })
})

describe('normalizeToType & compareByType', () => {
  const d = new Date(2026, 7, 18, 10)
  it('normalizes to the correct unit', () => {
    expect(normalizeToType(d, 'date')).toEqual(startOfDay(d))
    expect(normalizeToType(d, 'month')).toEqual(new Date(2026, 7, 1))
    expect(normalizeToType(d, 'year')).toEqual(new Date(2026, 0, 1))
  })

  it('compares at the requested granularity', () => {
    const other = new Date(2026, 7, 25)
    expect(compareByType(d, other, 'date')).toBe(-1)
    expect(compareByType(d, other, 'month')).toBe(0) // same month
    expect(compareByType(d, other, 'year')).toBe(0)
    expect(compareByType(new Date(2027, 0, 1), d, 'year')).toBe(1)
  })
})

describe('getMonthMatrix', () => {
  it('returns 6 weeks of 7 days', () => {
    const matrix = getMonthMatrix(new Date(2026, 7, 1), 1)
    expect(matrix).toHaveLength(6)
    matrix.forEach((week) => expect(week).toHaveLength(7))
  })

  it('honors first day of week (Monday)', () => {
    const matrix = getMonthMatrix(new Date(2026, 7, 1), 1)
    expect(matrix[0][0].getDay()).toBe(1) // Monday
  })

  it('honors first day of week (Sunday)', () => {
    const matrix = getMonthMatrix(new Date(2026, 7, 1), 0)
    expect(matrix[0][0].getDay()).toBe(0) // Sunday
  })

  it('includes the first of the target month within the grid', () => {
    const matrix = getMonthMatrix(new Date(2026, 7, 1), 1).flat()
    expect(matrix.some((d) => d.getMonth() === 7 && d.getDate() === 1)).toBe(true)
  })
})

describe('getMonthsOfYear / getYearsOfDecade', () => {
  it('returns the 12 months of the year', () => {
    const months = getMonthsOfYear(new Date(2026, 4, 1))
    expect(months).toHaveLength(12)
    expect(months[0]).toEqual(new Date(2026, 0, 1))
    expect(months[11]).toEqual(new Date(2026, 11, 1))
  })

  it('returns 12 years padded around the decade', () => {
    const years = getYearsOfDecade(new Date(2026, 0, 1)).map((d) => d.getFullYear())
    expect(years).toHaveLength(12)
    expect(years[0]).toBe(2019) // one leading
    expect(years[1]).toBe(2020) // decade start
    expect(years[11]).toBe(2030) // one trailing
  })
})

describe('label formatters (fr-FR)', () => {
  it('weekday labels start at the requested day', () => {
    const labels = getWeekdayLabels('fr-FR', 1, 'short')
    expect(labels).toHaveLength(7)
    expect(labels[0].toLowerCase()).toContain('lun')
  })

  it('month labels return 12 entries', () => {
    const labels = getMonthLabels('fr-FR', 'long')
    expect(labels).toHaveLength(12)
    expect(labels[0].toLowerCase()).toContain('janv')
  })
})

describe('formatValue', () => {
  const d = new Date(2026, 7, 18)
  it('formats per type', () => {
    expect(formatValue(d, 'date', 'fr-FR')).toBe('18/08/2026')
    expect(formatValue(d, 'month', 'fr-FR').toLowerCase()).toContain('août')
    expect(formatValue(d, 'year', 'fr-FR')).toBe('2026')
  })
  it('returns empty string for null', () => {
    expect(formatValue(null, 'date', 'fr-FR')).toBe('')
  })
})

describe('unitBounds', () => {
  const d = new Date(2026, 7, 18, 12)
  it('bounds a day', () => {
    const [lo, hi] = unitBounds(d, 'days')
    expect(lo.getHours()).toBe(0)
    expect(hi.getTime()).toBeGreaterThan(lo.getTime())
    expect(hi.getDate()).toBe(18)
  })
  it('bounds a month', () => {
    const [lo, hi] = unitBounds(d, 'months')
    expect(lo.getDate()).toBe(1)
    expect(hi.getDate()).toBe(31)
  })
  it('bounds a year', () => {
    const [lo, hi] = unitBounds(d, 'years')
    expect(lo.getMonth()).toBe(0)
    expect(hi.getMonth()).toBe(11)
  })
})

describe('view constants', () => {
  it('maps types to selection views', () => {
    expect(SELECTION_VIEW.date).toBe('days')
    expect(SELECTION_VIEW.month).toBe('months')
    expect(SELECTION_VIEW.year).toBe('years')
  })
  it('orders views from detailed to broad', () => {
    expect(VIEW_ORDER).toEqual(['days', 'months', 'years'])
    expect(viewIndex('days')).toBe(0)
    expect(viewIndex('years')).toBe(2)
  })
})

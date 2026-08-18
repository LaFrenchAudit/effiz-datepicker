import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import EffizCalendar from './EffizCalendar.vue'

// A fixed "today" so the initial panel is deterministic: 18 August 2026.
const TODAY = new Date(2026, 7, 18)

/** Mount with two-way binding, mirroring real `v-model` usage. */
function mountControlled(props: Record<string, unknown>) {
  let wrapper: ReturnType<typeof mount>
  wrapper = mount(EffizCalendar, {
    props: {
      ...props,
      'onUpdate:modelValue': (value: unknown) => wrapper.setProps({ modelValue: value }),
    },
  })
  return wrapper
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(TODAY)
})

afterEach(() => {
  vi.useRealTimers()
})

function cell(wrapper: ReturnType<typeof mount>, key: string) {
  return wrapper.get(`[data-key="${key}"]`)
}

describe('EffizCalendar — single date', () => {
  it('renders August 2026 by default and marks today', () => {
    const wrapper = mount(EffizCalendar, { props: { type: 'date', locale: 'fr-FR' } })
    expect(wrapper.get('.effiz-dp__title').text().toLowerCase()).toContain('août')
    expect(cell(wrapper, '2026-7-18').classes()).toContain('is-today')
  })

  it('emits a normalized Date on day click', async () => {
    const wrapper = mount(EffizCalendar, { props: { type: 'date' } })
    await cell(wrapper, '2026-7-15').trigger('click')
    const emitted = wrapper.emitted('update:modelValue')
    expect(emitted).toHaveLength(1)
    const value = emitted![0][0] as Date
    expect(value).toEqual(new Date(2026, 7, 15))
    expect(wrapper.emitted('select')).toHaveLength(1)
  })

  it('marks the selected day', () => {
    const wrapper = mount(EffizCalendar, {
      props: { type: 'date', modelValue: new Date(2026, 7, 10) },
    })
    expect(cell(wrapper, '2026-7-10').classes()).toContain('is-selected')
  })

  it('days from adjacent months are muted', () => {
    const wrapper = mount(EffizCalendar, { props: { type: 'date' } })
    // 31 July 2026 appears in the leading row of the August grid.
    expect(cell(wrapper, '2026-6-31').classes()).toContain('is-muted')
  })
})

describe('EffizCalendar — navigation', () => {
  it('prev/next shift the month', async () => {
    const wrapper = mount(EffizCalendar, { props: { type: 'date', locale: 'fr-FR' } })
    await wrapper.get('.effiz-dp__nav-btn').trigger('click') // prev
    expect(wrapper.get('.effiz-dp__title').text().toLowerCase()).toContain('juillet')
  })

  it('title click drills up days -> months -> years', async () => {
    const wrapper = mount(EffizCalendar, { props: { type: 'date' } })
    await wrapper.get('.effiz-dp__title').trigger('click')
    expect(wrapper.get('.effiz-dp__title').text()).toBe('2026')
    await wrapper.get('.effiz-dp__title').trigger('click')
    expect(wrapper.get('.effiz-dp__title').text()).toContain('2020')
    // Title is disabled at the top (years) view.
    expect((wrapper.get('.effiz-dp__title').element as HTMLButtonElement).disabled).toBe(true)
  })

  it('clicking a month in date mode drills into that month (no selection)', async () => {
    const wrapper = mount(EffizCalendar, { props: { type: 'date', locale: 'fr-FR' } })
    await wrapper.get('.effiz-dp__title').trigger('click') // months view
    await cell(wrapper, '2026-2').trigger('click') // March
    // Back in days view, on March, nothing selected yet.
    expect(wrapper.get('.effiz-dp__title').text().toLowerCase()).toContain('mars')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })
})

describe('EffizCalendar — month & year types', () => {
  it('month type selects the first of the month', async () => {
    const wrapper = mount(EffizCalendar, { props: { type: 'month' } })
    // Starts directly in the months view.
    await cell(wrapper, '2026-2').trigger('click')
    expect(wrapper.emitted('update:modelValue')![0][0]).toEqual(new Date(2026, 2, 1))
    expect(wrapper.emitted('select')).toHaveLength(1)
  })

  it('year type selects the first of the year', async () => {
    const wrapper = mount(EffizCalendar, { props: { type: 'year' } })
    await cell(wrapper, '2028').trigger('click')
    expect(wrapper.emitted('update:modelValue')![0][0]).toEqual(new Date(2028, 0, 1))
  })
})

describe('EffizCalendar — range', () => {
  it('emits ordered [start, end] over two clicks', async () => {
    const wrapper = mountControlled({ type: 'date', range: true })
    await cell(wrapper, '2026-7-10').trigger('click')
    await flushPromises()
    expect(wrapper.emitted('update:modelValue')![0][0]).toEqual([new Date(2026, 7, 10), null])
    expect(wrapper.emitted('range-complete')).toBeUndefined()

    await cell(wrapper, '2026-7-20').trigger('click')
    await flushPromises()
    expect(wrapper.emitted('update:modelValue')![1][0]).toEqual([
      new Date(2026, 7, 10),
      new Date(2026, 7, 20),
    ])
    expect(wrapper.emitted('range-complete')).toHaveLength(1)
  })

  it('swaps endpoints when the second click precedes the first', async () => {
    const wrapper = mountControlled({ type: 'date', range: true })
    await cell(wrapper, '2026-7-20').trigger('click')
    await flushPromises()
    await cell(wrapper, '2026-7-10').trigger('click')
    await flushPromises()
    expect(wrapper.emitted('update:modelValue')![1][0]).toEqual([
      new Date(2026, 7, 10),
      new Date(2026, 7, 20),
    ])
  })

  it('highlights the in-between days and the endpoints', () => {
    const wrapper = mount(EffizCalendar, {
      props: {
        type: 'date',
        range: true,
        modelValue: [new Date(2026, 7, 10), new Date(2026, 7, 20)],
      },
    })
    expect(cell(wrapper, '2026-7-10').classes()).toContain('is-range-start')
    expect(cell(wrapper, '2026-7-20').classes()).toContain('is-range-end')
    // A mid-range day: its wrapper carries the band class.
    const midWrap = wrapper.get('[data-key="2026-7-15"]').element.parentElement!
    expect(midWrap.classList.contains('is-in-range')).toBe(true)
  })

  it('a third click starts a fresh range', async () => {
    const wrapper = mount(EffizCalendar, {
      props: {
        type: 'date',
        range: true,
        modelValue: [new Date(2026, 7, 10), new Date(2026, 7, 20)],
      },
    })
    await cell(wrapper, '2026-7-5').trigger('click')
    expect(wrapper.emitted('update:modelValue')![0][0]).toEqual([new Date(2026, 7, 5), null])
  })
})

describe('EffizCalendar — constraints', () => {
  it('disables days outside min/max', () => {
    const wrapper = mount(EffizCalendar, {
      props: { type: 'date', min: new Date(2026, 7, 10), max: new Date(2026, 7, 20) },
    })
    expect((cell(wrapper, '2026-7-5').element as HTMLButtonElement).disabled).toBe(true)
    expect((cell(wrapper, '2026-7-15').element as HTMLButtonElement).disabled).toBe(false)
    expect((cell(wrapper, '2026-7-25').element as HTMLButtonElement).disabled).toBe(true)
  })

  it('does not emit when a disabled day is clicked', async () => {
    const wrapper = mount(EffizCalendar, {
      props: { type: 'date', min: new Date(2026, 7, 10) },
    })
    await cell(wrapper, '2026-7-5').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('honors a disabledDate predicate', () => {
    const wrapper = mount(EffizCalendar, {
      props: { type: 'date', disabledDate: (d: Date) => d.getDate() === 15 },
    })
    expect((cell(wrapper, '2026-7-15').element as HTMLButtonElement).disabled).toBe(true)
    expect((cell(wrapper, '2026-7-16').element as HTMLButtonElement).disabled).toBe(false)
  })
})

describe('EffizCalendar — footer', () => {
  it('today button selects today', async () => {
    const wrapper = mount(EffizCalendar, { props: { type: 'date' } })
    await wrapper.get('.effiz-dp__footer-btn--today').trigger('click')
    expect(wrapper.emitted('update:modelValue')![0][0]).toEqual(TODAY)
  })

  it('clear button emits null (single) and [null, null] (range)', async () => {
    const single = mount(EffizCalendar, {
      props: { type: 'date', modelValue: new Date(2026, 7, 10) },
    })
    await single.get('.effiz-dp__footer-btn--clear').trigger('click')
    expect(single.emitted('update:modelValue')![0][0]).toBeNull()

    const range = mount(EffizCalendar, {
      props: { type: 'date', range: true, modelValue: [new Date(2026, 7, 10), null] },
    })
    await range.get('.effiz-dp__footer-btn--clear').trigger('click')
    expect(range.emitted('update:modelValue')![0][0]).toEqual([null, null])
  })

  it('can hide footer buttons', () => {
    const wrapper = mount(EffizCalendar, {
      props: { type: 'date', showToday: false, showClear: false },
    })
    expect(wrapper.find('.effiz-dp__footer').exists()).toBe(false)
  })
})

describe('EffizCalendar — keyboard', () => {
  it('arrow keys move focus and Enter selects', async () => {
    const wrapper = mount(EffizCalendar, { props: { type: 'date' }, attachTo: document.body })
    const grid = wrapper.get('.effiz-dp__grid')
    // Focus starts on today (18). ArrowRight -> 19, ArrowDown -> 26.
    await grid.trigger('keydown', { key: 'ArrowRight' })
    await grid.trigger('keydown', { key: 'ArrowDown' })
    await grid.trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('update:modelValue')![0][0]).toEqual(new Date(2026, 7, 26))
    wrapper.unmount()
  })
})

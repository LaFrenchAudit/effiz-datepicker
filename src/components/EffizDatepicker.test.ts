import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import EffizDatepicker from './EffizDatepicker.vue'

const TODAY = new Date(2026, 7, 18)

/** Mount with two-way binding, mirroring real `v-model` usage. */
function mountControlled(props: Record<string, unknown>) {
  let wrapper: ReturnType<typeof mount>
  wrapper = mount(EffizDatepicker, {
    props: {
      ...props,
      'onUpdate:modelValue': (value: unknown) => wrapper.setProps({ modelValue: value }),
    },
    attachTo: document.body,
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

describe('EffizDatepicker — input display', () => {
  it('formats a single value with the locale', () => {
    const wrapper = mount(EffizDatepicker, {
      props: { modelValue: new Date(2026, 7, 18), locale: 'fr-FR' },
    })
    expect((wrapper.get('input').element as HTMLInputElement).value).toBe('18/08/2026')
  })

  it('formats a range with the separator', () => {
    const wrapper = mount(EffizDatepicker, {
      props: {
        range: true,
        modelValue: [new Date(2026, 7, 10), new Date(2026, 7, 20)],
        locale: 'fr-FR',
        separator: ' -> ',
      },
    })
    expect((wrapper.get('input').element as HTMLInputElement).value).toBe('10/08/2026 -> 20/08/2026')
  })

  it('uses a custom formatter when provided', () => {
    const wrapper = mount(EffizDatepicker, {
      props: {
        modelValue: new Date(2026, 7, 18),
        format: (d: Date) => `#${d.getFullYear()}`,
      },
    })
    expect((wrapper.get('input').element as HTMLInputElement).value).toBe('#2026')
  })

  it('shows the placeholder when empty', () => {
    const wrapper = mount(EffizDatepicker, { props: { placeholder: 'Choisir…' } })
    expect(wrapper.get('input').attributes('placeholder')).toBe('Choisir…')
    expect((wrapper.get('input').element as HTMLInputElement).value).toBe('')
  })
})

describe('EffizDatepicker — popover', () => {
  it('opens on click and closes after a single selection', async () => {
    const wrapper = mount(EffizDatepicker, { props: { locale: 'fr-FR' }, attachTo: document.body })
    expect(wrapper.find('.effiz-dp__dropdown').exists()).toBe(false)

    await wrapper.get('input').trigger('click')
    expect(wrapper.find('.effiz-dp__dropdown').exists()).toBe(true)

    await wrapper.get('[data-key="2026-7-15"]').trigger('click')
    expect(wrapper.emitted('update:modelValue')![0][0]).toEqual(new Date(2026, 7, 15))
    expect(wrapper.find('.effiz-dp__dropdown').exists()).toBe(false)
    wrapper.unmount()
  })

  it('stays open after the first click of a range, closes on completion', async () => {
    const wrapper = mountControlled({ range: true, closeOnSelect: true })
    await wrapper.get('input').trigger('click')
    await wrapper.get('[data-key="2026-7-10"]').trigger('click')
    await flushPromises()
    expect(wrapper.find('.effiz-dp__dropdown').exists()).toBe(true)

    await wrapper.get('[data-key="2026-7-20"]').trigger('click')
    await flushPromises()
    expect(wrapper.find('.effiz-dp__dropdown').exists()).toBe(false)
    wrapper.unmount()
  })

  it('opens with the ArrowDown key', async () => {
    const wrapper = mount(EffizDatepicker, { attachTo: document.body })
    await wrapper.get('input').trigger('keydown', { key: 'ArrowDown' })
    expect(wrapper.find('.effiz-dp__dropdown').exists()).toBe(true)
    wrapper.unmount()
  })

  it('closes on Escape', async () => {
    const wrapper = mount(EffizDatepicker, { attachTo: document.body })
    await wrapper.get('input').trigger('click')
    expect(wrapper.find('.effiz-dp__dropdown').exists()).toBe(true)
    await wrapper.get('input').trigger('keydown', { key: 'Escape' })
    expect(wrapper.find('.effiz-dp__dropdown').exists()).toBe(false)
    wrapper.unmount()
  })

  it('does not open when disabled', async () => {
    const wrapper = mount(EffizDatepicker, { props: { disabled: true } })
    await wrapper.get('input').trigger('click')
    expect(wrapper.find('.effiz-dp__dropdown').exists()).toBe(false)
  })
})

describe('EffizDatepicker — clear', () => {
  it('renders a clear button only when a value is present', async () => {
    const wrapper = mount(EffizDatepicker, {
      props: { modelValue: new Date(2026, 7, 18), clearable: true },
    })
    expect(wrapper.find('.effiz-dp__clear').exists()).toBe(true)
    await wrapper.get('.effiz-dp__clear').trigger('click')
    expect(wrapper.emitted('update:modelValue')![0][0]).toBeNull()
    expect(wrapper.emitted('clear')).toHaveLength(1)
  })

  it('hides the clear button when empty or not clearable', () => {
    expect(mount(EffizDatepicker).find('.effiz-dp__clear').exists()).toBe(false)
    expect(
      mount(EffizDatepicker, {
        props: { modelValue: new Date(2026, 7, 18), clearable: false },
      }).find('.effiz-dp__clear').exists(),
    ).toBe(false)
  })
})

describe('EffizDatepicker — theming & inline', () => {
  it('applies the primary color as a CSS variable', () => {
    const wrapper = mount(EffizDatepicker, { props: { primaryColor: '#7c3aed' } })
    expect(wrapper.get('.effiz-dp').attributes('style')).toContain('--effiz-dp-primary: #7c3aed')
  })

  it('toggles the dark class', () => {
    const wrapper = mount(EffizDatepicker, { props: { dark: true } })
    expect(wrapper.get('.effiz-dp').classes()).toContain('effiz-dp--dark')
  })

  it('inline mode renders the calendar without an input', () => {
    const wrapper = mount(EffizDatepicker, { props: { inline: true } })
    expect(wrapper.find('input').exists()).toBe(false)
    expect(wrapper.find('.effiz-dp__panel').exists()).toBe(true)
  })
})

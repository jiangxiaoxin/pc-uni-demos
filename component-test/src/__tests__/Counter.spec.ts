import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Counter from '../components/Counter.vue'

describe('Counter', () => {
  it('renders initial value', () => {
    const wrapper = mount(Counter, {
      props: { initial: 5 },
    })
    expect(wrapper.find('.display').text()).toBe('5')
  })

  it('increments on + button click', async () => {
    const wrapper = mount(Counter)
    await wrapper.find('.btn-inc').trigger('click')
    expect(wrapper.find('.display').text()).toBe('1')
  })

  it('decrements on - button click', async () => {
    const wrapper = mount(Counter, {
      props: { initial: 5 },
    })
    await wrapper.find('.btn-dec').trigger('click')
    expect(wrapper.find('.display').text()).toBe('4')
  })

  it('resets to initial value', async () => {
    const wrapper = mount(Counter, {
      props: { initial: 10 },
    })
    await wrapper.find('.btn-inc').trigger('click')
    expect(wrapper.find('.display').text()).toBe('11')

    await wrapper.find('.btn-reset').trigger('click')
    expect(wrapper.find('.display').text()).toBe('10')
  })

  it('respects max limit and emits reachMax', async () => {
    const wrapper = mount(Counter, {
      props: { initial: 8, max: 10, step: 2 },
    })
    await wrapper.find('.btn-inc').trigger('click')
    expect(wrapper.find('.display').text()).toBe('10')
    expect(wrapper.emitted()).not.toHaveProperty('reachMax')

    await wrapper.find('.btn-inc').trigger('click')
    expect(wrapper.find('.display').text()).toBe('10')
    expect(wrapper.emitted()).toHaveProperty('reachMax')
  })

  it('respects min limit and emits reachMin', async () => {
    const wrapper = mount(Counter, {
      props: { initial: 2, min: 0, step: 2 },
    })
    await wrapper.find('.btn-dec').trigger('click')
    expect(wrapper.find('.display').text()).toBe('0')
    expect(wrapper.emitted()).not.toHaveProperty('reachMin')

    await wrapper.find('.btn-dec').trigger('click')
    expect(wrapper.find('.display').text()).toBe('0')
    expect(wrapper.emitted()).toHaveProperty('reachMin')
  })

  it('emits change event on value change', async () => {
    const wrapper = mount(Counter, {
      props: { initial: 0 },
    })
    await wrapper.find('.btn-inc').trigger('click')
    expect(wrapper.emitted('change')).toHaveLength(1)
    expect(wrapper.emitted('change')![0]).toEqual([1])
  })

  it('disables buttons when disabled prop is true', () => {
    const wrapper = mount(Counter, {
      props: { disabled: true },
    })
    const buttons = wrapper.findAll('.controls button')
    expect(buttons[0].attributes('disabled')).toBeDefined()
    expect(buttons[2].attributes('disabled')).toBeDefined()
  })
})

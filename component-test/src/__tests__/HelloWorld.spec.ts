import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import HelloWorld from '../components/HelloWorld.vue'

describe('HelloWorld', () => {
  it('renders props.msg correctly', () => {
    const wrapper = mount(HelloWorld, {
      props: { msg: 'Hello Vitest' },
    })
    expect(wrapper.find('h1').text()).toBe('Hello Vitest')
  })

  it('increments count when button is clicked', async () => {
    const wrapper = mount(HelloWorld, {
      props: { msg: 'Test' },
    })
    const button = wrapper.find('button')
    expect(button.text()).toContain('0')

    await button.trigger('click')
    expect(button.text()).toContain('1')

    await button.trigger('click')
    expect(button.text()).toContain('2')
  })
})

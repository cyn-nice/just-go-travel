import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import DestinationCard from './DestinationCard.vue'

describe('DestinationCard', () => {
  it('shows the core trip facts', () => {
    const item:any={id:1,name:'威海',province:'山东',cover:'x',slogan:'看海',features:['海岸'],days:3,bestMonths:[5,6,7,8,9],score:90}
    const wrapper=mount(DestinationCard,{props:{item,rank:1},global:{mocks:{$router:{push:()=>{}}},directives:{lazy:{}}}})
    expect(wrapper.text()).toContain('威海')
    expect(wrapper.text()).toContain('建议 3 天')
    expect(wrapper.text()).toContain('5、6、7、8、9 月适宜')
  })
})

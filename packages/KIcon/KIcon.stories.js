import { storiesOf } from '@storybook/vue'
import { withInfo } from 'storybook-addon-vue-info'
import KIcon from './KIcon.vue'
import icons from './icons'
const iconNames = Object.keys(icons)

storiesOf('Icon', module)
  .add('Icons', () => ({
    components: { KIcon },
    template: `<div>
      ${iconNames.map(name => {
      return `<KIcon icon="${name}" />
      `
    }).join('')}
    </div>`
  }), {info: {}})
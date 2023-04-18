import { Meta, Story } from '@storybook/angular'

import { TheSeamWizardProgressListComponent } from './wizard-progress-list.component'

export default {
  title: 'Wizard/ProgressList',
  component: TheSeamWizardProgressListComponent,
} as Meta

export const Basic: Story = args => ({
  props: args,
})
// Basic.args = {
//   phone: '9015555555'
// }

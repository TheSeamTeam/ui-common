import { Meta, moduleMetadata, Story } from '@storybook/angular'

import { TheSeamWizarProgressListComponent } from './wizard-progress-list.component'

export default {
  title: 'Wizard/ProgressList',
  component: TheSeamWizarProgressListComponent,
} as Meta

export const Basic: Story = (args) => ({
  props: args
})
// Basic.args = {
//   phone: '9015555555'
// }

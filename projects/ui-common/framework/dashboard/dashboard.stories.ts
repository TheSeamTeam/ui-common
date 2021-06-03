// import { select, text, withKnobs } from '@storybook/addon-knobs'
import { Meta, moduleMetadata, Story } from '@storybook/angular'

import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { DashboardComponent } from './dashboard.component'
import { TheSeamDashboardModule } from './dashboard.module'

export default {
  title: 'Framework/Dashboard',
  component: DashboardComponent,
  decorators: [
    // withKnobs
    moduleMetadata({
      declarations: [],
      imports: [
        BrowserAnimationsModule,
        TheSeamDashboardModule
      ]
    })
  ]
} as Meta

export const Example: Story = (args) => ({
  props: { },
  template: `
    <seam-dashboard></seam-dashboard>
  `
})


// storiesOf('Framework/Dashboard', module)
//   // .addDecorator(withKnobs)

//   .add('Basic', () => ({
//     moduleMetadata: {
//       declarations: [],
//       imports: [
//         BrowserAnimationsModule,
//         TheSeamDashboardModule
//       ]
//     },
//     props: { },
//     template: `
//       <seam-dashboard></seam-dashboard>
//     `
//   }))

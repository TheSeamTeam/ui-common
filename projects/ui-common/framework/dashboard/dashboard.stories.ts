import { select, text, withKnobs } from '@storybook/addon-knobs'
import { storiesOf } from '@storybook/angular'

import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { TheSeamDashboardModule } from './dashboard.module'

storiesOf('Framework/Dashboard', module)
  .addDecorator(withKnobs)

  .add('Basic', () => ({
    moduleMetadata: {
      declarations: [],
      imports: [
        BrowserAnimationsModule,
        TheSeamDashboardModule
      ]
    },
    props: { },
    template: `
      <seam-dashboard></seam-dashboard>
    `
  }))

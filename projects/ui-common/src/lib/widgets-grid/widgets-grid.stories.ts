import { select, text, withKnobs } from '@storybook/addon-knobs'
import { storiesOf } from '@storybook/angular'

import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { TheSeamWidgetsGridModule } from './widgets-grid.module'

storiesOf('WidgetsGrid', module)
  .addDecorator(withKnobs)

  .add('Basic', () => ({
    moduleMetadata: {
      declarations: [],
      imports: [
        BrowserAnimationsModule,
        TheSeamWidgetsGridModule
      ]
    },
    props: { },
    template: `
      <div style="height: 100vh;">
        <seam-widgets-grid></seam-widgets-grid>
      </div>
    `
  }))

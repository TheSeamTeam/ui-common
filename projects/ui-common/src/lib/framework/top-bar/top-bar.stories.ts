import { select, text, withKnobs } from '@storybook/addon-knobs'
import { storiesOf } from '@storybook/angular'

import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { TheSeamTopBarModule } from './top-bar.module'

storiesOf('Framework/TopBar', module)
  .addDecorator(withKnobs)

  .add('Basic', () => ({
    moduleMetadata: {
      declarations: [],
      imports: [
        BrowserAnimationsModule,
        TheSeamTopBarModule
      ]
    },
    props: {
      logo: text('logo', 'assets/images/theseam_logo.svg'),
      logoSm: text('logoSm', 'assets/images/theseam_logo_notext.svg'),
      titleText: text('titleText', 'Dashboard'),
      subTitleText: text('subTitleText', 'Example'),
      displayName: text('displayName', 'Mark Berry'),
      organizationName: text('organizationName', 'The Seam')
    },
    template: `
      <seam-top-bar
        [logo]="logo"
        [logoSm]="logoSm"
        [titleText]="titleText"
        [subTitleText]="subTitleText"
        [displayName]="displayName"
        [organizationName]="organizationName">
      </seam-top-bar>
    `
  }))

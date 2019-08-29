import { select, text, withKnobs } from '@storybook/addon-knobs'
import { storiesOf } from '@storybook/angular'

import { TheSeamTopBarModule } from './top-bar.module'

storiesOf('Framework/TopBar', module)
  .addDecorator(withKnobs)

  .add('Basic', () => ({
    moduleMetadata: {
      declarations: [],
      imports: [
        TheSeamTopBarModule
      ]
    },
    props: {
      logo: 'assets/images/theseam_logo.svg',
      logoSm: 'assets/images/theseam_logo_notext.svg'
    },
    template: `
      <seam-top-bar
        [logo]="logo"
        [logoSm]="logoSm">
      </seam-top-bar>
    `
  }))

import { action } from '@storybook/addon-actions'
// import { boolean, select, text, withKnobs } from '@storybook/addon-knobs'
import { linkTo } from '@storybook/addon-links'
import { storiesOf } from '@storybook/angular'

import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { faWrench } from '@fortawesome/free-solid-svg-icons'

import { TheSeamWidgetModule } from '../../widget.module'

storiesOf('Components/Widget/Content', module)
  // .addDecorator(withKnobs)

  .add('Description', () => ({
    moduleMetadata: {
      imports: [
        TheSeamWidgetModule,
        BrowserAnimationsModule
      ]
    },
    props: {
      icon: faWrench,
      // title: text('Header Title', 'Example Widget'),
      // loading: boolean('Loading', false),
      // // tslint:disable-next-line:max-line-length
      // descText: text('Description Text', 'Anim eiusmod aliquip veniam anim est do. Pariatur officia dolore proident do ad et enim laborum voluptate reprehenderit. Aute voluptate irure deserunt do est dolore esse minim. Deserunt do enim ea esse duis velit id cillum sunt. Officia laboris incididunt esse elit laboris. Occaecat anim magna quis mollit occaecat ad quis proident laborum.'),
    },
    template: `
      <div class="p-1" style="max-height: 400px; width: 500px;">
        <seam-widget [icon]="icon" [titleText]="title" [loading]="loading">
          <seam-widget-description>{{ descText }}</seam-widget-description>
        </seam-widget>
      </div>`
  }))

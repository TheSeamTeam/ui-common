import { select, text, withKnobs } from '@storybook/addon-knobs'
import { storiesOf } from '@storybook/angular'

import { Component } from '@angular/core'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { TheSeamWidgetsGridModule } from './widgets-grid.module'

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'story-ex-widget-1',
  template: `Example Widget 1`
})
class StoryExWidget1Component {  }

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'story-ex-widget-2',
  template: `Example Widget 2`
})
class StoryExWidget2Component {  }

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'story-ex-widget-3',
  template: `Example Widget 3`
})
class StoryExWidget3Component {  }

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'story-ex-widget-4',
  template: `Example Widget 4`
})
class StoryExWidget4Component {  }

storiesOf('WidgetsGrid', module)
  .addDecorator(withKnobs)

  .add('Basic', () => ({
    moduleMetadata: {
      declarations: [
        StoryExWidget1Component,
        StoryExWidget2Component,
        StoryExWidget3Component,
        StoryExWidget4Component
      ],
      imports: [
        BrowserAnimationsModule,
        TheSeamWidgetsGridModule
      ],
      entryComponents: [
        StoryExWidget1Component,
        StoryExWidget2Component,
        StoryExWidget3Component,
        StoryExWidget4Component
      ]
    },
    props: {
      widgets: [
        { type: StoryExWidget1Component },
        { type: StoryExWidget2Component },
        { type: StoryExWidget3Component },
        { type: StoryExWidget4Component }
      ]
    },
    template: `
      <div style="height: 100vh;">
        <seam-widgets-grid [widgets]="widgets"></seam-widgets-grid>
      </div>
    `
  }))

import { moduleMetadata } from '@storybook/angular'

import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { TheSeamPopoverDirective } from './popover.directive'
import { TheSeamPopoverModule } from './popover.module'

export default {
  title: 'Components/Popover',
  component: TheSeamPopoverDirective,
  decorators: [
    moduleMetadata({
      imports: [
        BrowserAnimationsModule,
        BrowserModule,
        TheSeamPopoverModule
      ]
    })
  ],
  parameters: {
    docs: {
      iframeHeight: '200px',
    }
  }
}

export const Popover = () => ({
  template: `
    <div class="p-1">
      <ng-template #popoverTpl>
        Example Popover
      </ng-template>
      <button type="button" class="btn btn-primary" [seamPopover]="popoverTpl">Open Popover</button>
    </div>
  `
})

Popover.story = {
  name: 'Popover'
}

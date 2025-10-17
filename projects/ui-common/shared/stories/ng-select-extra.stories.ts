import { Meta, moduleMetadata, StoryObj } from '@storybook/angular'

import { FormControl, ReactiveFormsModule } from '@angular/forms'

import { NgSelectModule } from '@ng-select/ng-select'
import { TheSeamOverlayScrollbarDirective } from '@theseam/ui-common/scrollbar'

import { TheSeamNgSelectExtraDirective } from '../directives'

interface StoryExtraProps {}

const meta: Meta<TheSeamNgSelectExtraDirective & StoryExtraProps> = {
  title: 'Shared/NgSelectExtra',
  component: TheSeamNgSelectExtraDirective,
  decorators: [
    moduleMetadata({
      imports: [
        NgSelectModule,
        ReactiveFormsModule,
        TheSeamOverlayScrollbarDirective,
      ],
    }),
  ],
}

export default meta
type Story = StoryObj<TheSeamNgSelectExtraDirective & StoryExtraProps>

export const Basic: Story = {
  render: (args) => ({
    props: {
      ...args,
      control: new FormControl(),
      items: [
        'one',
        'two',
        'three',
        'wd',
        'th1ree',
        'th2ree',
        'thr3ee',
        'th4ree',
        'thr5ee',
        'th6ree',
        'th7ree',
      ],
    },
    template: `
      <div style="height: 400px; box-sizing: border-box; border: 1px solid blue; overflow: scroll;"
        [seamOverlayScrollbar]="{ overflowBehavior: { x: 'hidden' } }">
        <div style="height: 1500px; padding-top: 150px;">
          <ng-select
            [formControl]="control"
            class="form-control"
            appendTo="body"
            [items]="items">
          </ng-select>
        </div>
      </div>`,
  }),
}

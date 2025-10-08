import { Meta, moduleMetadata, StoryObj } from '@storybook/angular'

import { NgIf } from '@angular/common'

import { TheSeamAutoFocusDirective } from '../directives/auto-focus.directive'

interface StoryExtraProps { }

const meta: Meta<TheSeamAutoFocusDirective & StoryExtraProps> = {
  title: 'Shared/AutoFocus',
  component: TheSeamAutoFocusDirective,
  decorators: [
    moduleMetadata({
      imports: [
        NgIf,
      ],
    }),
  ],
}

export default meta
type Story = StoryObj<TheSeamAutoFocusDirective & StoryExtraProps>

export const Basic: Story = {
  render: args => ({
    props: {
      ...args,
      visible: false,
    },
    template: `
      <button type="button" class="btn btn-primary" (click)="visible=!visible">
        Toggle Form
      </button>
      <form *ngIf="visible">
        <div class="form-group">
          <label for="one">Not Focused</label>
          <input id="one" type="text" class="form-control" />
        </div>
        <div class="form-group">
          <label for="two">Focused</label>
          <input id="two" type="text" seamAutoFocus class="form-control" />
        </div>
      </form>`,
  }),
}

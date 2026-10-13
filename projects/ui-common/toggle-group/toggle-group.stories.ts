import { Meta, moduleMetadata, StoryObj } from '@storybook/angular'
import { expect } from 'storybook/test'

import { getHarness } from '@theseam/ui-common/testing'
import { ArgsTplOptions, argsToTpl } from '@theseam/ui-common/story-helpers'
import { TheSeamCheckboxComponent } from '@theseam/ui-common/checkbox'

import { ToggleGroupDirective } from './toggle-group.directive'
import { FormControl, ReactiveFormsModule } from '@angular/forms'
import { TheSeamToggleGroupModule } from './toggle-group.module'
// import { TheSeamCheckboxHarness } from './testing/checkbox.harness'

interface ExtraArgs {
  ngContent: string
}
type StoryComponentType = ToggleGroupDirective & ExtraArgs

const meta: Meta<StoryComponentType> = {
  title: 'ToggleGroup/Components',
  tags: ['autodocs'],
  component: ToggleGroupDirective,
  // render: args => ({
  //   props: args,
  //   template: `<seam-checkbox ${argsToTpl()}>{{ngContent}}</seam-checkbox>`
  // }),
  decorators: [
    moduleMetadata({
      imports: [
        TheSeamToggleGroupModule,
        TheSeamCheckboxComponent,
        ReactiveFormsModule,
      ],
    }),
  ],
  parameters: {
    // docs: {
    //   iframeHeight: '40px',
    // },
    argsToTplOptions: {
      exclude: ['ngContent'],
    } satisfies ArgsTplOptions,
  },
}

export default meta
type Story = StoryObj<StoryComponentType>

export const Basic: Story = {
  render: (args) => ({
    props: {
      ...args,
      control: new FormControl(),
      options: [
        {
          name: 'Option 1',
          value: 'option1',
        },
        {
          name: 'Option 2',
          value: 'option2',
        },
        {
          name: 'Option 3',
          value: 'option3',
        },
        {
          name: 'Option 4',
          value: 'option4',
        },
      ],
      selectionToggleable: true,
      multiple: true,
    },
    template: `
      <div role="group"
        [formControl]="control"
        seamToggleGroup
        #tg="seamToggleGroup"
        [multiple]="multiple"
        [selectionToggleable]="selectionToggleable">
        <ng-container *ngFor="let btn of options">
          <button type="button" class="btn btn-sm px-4"
            [seamToggleGroupOption]="btn.value"
            [class.btn-lightgray]="!tg.isSelected(btn.value)"
            [class.btn-primary]="tg.isSelected(btn.value)"
            (click)="tg.toggleOptionSelect(btn.value)">
            {{ btn.name || btn.value }}
          </button>
        </ng-container>
      </div>
      {{ { value: control.value } | json }}
    `,
  }),
  args: {
    ngContent: 'Group',
  },
  // play: async ({ canvasElement, fixture }) => {
  //   const checkboxHarness = await getHarness(TheSeamCheckboxHarness, { canvasElement, fixture })
  //   await expect(await checkboxHarness.isChecked()).toBe(false)
  // },
}

export const Checkbox: Story = {
  render: (args) => ({
    props: {
      ...args,
      control: new FormControl(),
      options: [
        {
          name: 'Option 1',
          value: 'option1',
        },
        {
          name: 'Option 2',
          value: 'option2',
        },
        {
          name: 'Option 3',
          value: 'option3',
        },
        {
          name: 'Option 4',
          value: 'option4',
        },
      ],
      selectionToggleable: true,
      multiple: true,
    },
    template: `
      <div role="group"
        [formControl]="control"
        seamToggleGroup
        #tg="seamToggleGroup"
        [multiple]="multiple"
        [selectionToggleable]="selectionToggleable">
        <ng-container *ngFor="let btn of options">
          <seam-checkbox
            [seamToggleGroupOption]="btn.value"
            [checked]="tg.isSelected(btn.value)"
            (change)="tg.toggleOptionSelect(btn.value)">
            {{ btn.name || btn.value }}
          </seam-checkbox>
        </ng-container>
      </div>
      {{ { value: control.value } | json }}
    `,
  }),
  args: {
    ngContent: 'Group',
  },
  // play: async ({ canvasElement, fixture }) => {
  //   const checkboxHarness = await getHarness(TheSeamCheckboxHarness, { canvasElement, fixture })
  //   await expect(await checkboxHarness.isChecked()).toBe(false)
  // },
}

import { Meta, moduleMetadata, StoryObj } from '@storybook/angular'
import { applicationConfig } from '@storybook/angular/dist/client/decorators'

import { importProvidersFrom } from '@angular/core'
import { provideAnimations } from '@angular/platform-browser/animations'
import { RouterModule } from '@angular/router'

import { faEnvelope } from '@fortawesome/free-regular-svg-icons'
import { faPuzzlePiece, faWrench } from '@fortawesome/free-solid-svg-icons'

import { TheSeamButtonsModule } from '@theseam/ui-common/buttons'
import { SeamIcon, TheSeamIconModule } from '@theseam/ui-common/icon'
import { _knobUndefinedNullHACK } from '../../../../utils/storybook-knobs-hack'

import { TheSeamWidgetModule } from '../../../widget.module'
import { WidgetListGroupItemComponent } from './widget-list-group-item.component'

const iconLookup = {
  'fa-icon': faPuzzlePiece as any,
  'img': 'assets/images/icons8-cotton-filled-48.png',
  'wide-img': 'assets/images/landdb-14d6a0.PNG'
}

interface ExtraArgs {
  itemIcon?: SeamIcon
}

const meta: Meta<WidgetListGroupItemComponent & ExtraArgs> = {
  title: 'Widget/Components/Content/List Group/Item',
  component: WidgetListGroupItemComponent,
  decorators: [
    applicationConfig({
      providers: [
        provideAnimations(),
        importProvidersFrom(
          RouterModule.forRoot([], { useHash: true }),
        ),
      ],
    }),
    moduleMetadata({
      imports: [
        TheSeamWidgetModule,
        TheSeamButtonsModule,
        TheSeamIconModule,
      ],
    }),
  ],
}

export default meta
type Story = StoryObj<WidgetListGroupItemComponent & ExtraArgs>

export const Basic: Story = {
  render: args => ({
    props: {
      ...args,
      icon: faWrench,
      faEnvelope,
    },
    template: `
      <div class="p-1" style="max-height: 400px; width: 500px;">
        <seam-widget [icon]="icon" titleText="Example Widget" loading="false">
          <seam-widget-list-group>
            <seam-widget-list-group-item label="Item 1"></seam-widget-list-group-item>
            <seam-widget-list-group-item label="Item 2"></seam-widget-list-group-item>
            <seam-widget-list-group-item label="Item 3"></seam-widget-list-group-item>
          </seam-widget-list-group>
        </seam-widget>
      </div>`,
  }),
}

export const Link: Story = {
  render: args => ({
    props: {
      ...args,
      icon: faWrench,
      faEnvelope,
    },
    template: `
      <div class="p-1" style="max-height: 400px; width: 500px;">
        <seam-widget [icon]="icon" titleText="Example Widget" loading="false">
          <seam-widget-list-group>
            <a seamWidgetListGroupItem label="Item 1">Item 1</a>
            <a seamWidgetListGroupItem label="Item 2">Item 2</a>
            <a seamWidgetListGroupItem label="Item 3">Item 3</a>
          </seam-widget-list-group>
        </seam-widget>
      </div>`,
  }),
}

export const Button: Story = {
  render: args => ({
    props: {
      ...args,
      icon: faWrench,
      faEnvelope,
    },
    template: `
      <div class="p-1" style="max-height: 400px; width: 500px;">
        <seam-widget [icon]="icon" titleText="Example Widget" loading="false">
          <seam-widget-list-group>
            <button seamWidgetListGroupItem label="Item 1">Item 1</button>
            <button seamWidgetListGroupItem label="Item 2">Item 2</button>
            <button seamWidgetListGroupItem label="Item 3">Item 3</button>
          </seam-widget-list-group>
        </seam-widget>
      </div>`,
  }),
}

export const LabelOnly: Story = {
  render: args => ({
    props: {
      ...args,
      icon: faWrench,
      faEnvelope,
    },
    template: `
      <div class="p-1" style="max-height: 400px; width: 500px;">
        <seam-widget [icon]="icon" titleText="Example Widget" loading="false">
          <seam-widget-list-group>
            <seam-widget-list-group-item [label]="label"></seam-widget-list-group-item>
          </seam-widget-list-group>
        </seam-widget>
      </div>`,
  }),
  args: {
    label: 'Example Label',
  },
}

export const IconWithLabel: Story = {
  render: args => ({
    props: {
      ...args,
      icon: faWrench,
      faEnvelope,
    },
    template: `
      <div class="p-1" style="max-height: 400px; width: 500px;">
        <seam-widget [icon]="icon" titleText="Example Widget" loading="false">
          <seam-widget-list-group>
            <seam-widget-list-group-item [icon]="itemIcon" [label]="label"></seam-widget-list-group-item>
          </seam-widget-list-group>
        </seam-widget>
      </div>`,
  }),
  args: {
    label: 'Example Label',
    itemIcon: 'fa-icon',
  },
  argTypes: {
    itemIcon: {
      options: Object.keys(iconLookup),
      mapping: iconLookup,
      control: { type: 'select' },
    },
  },
}

export const SecondaryIcon: Story = {
  render: args => ({
    props: {
      ...args,
      icon: faWrench,
      faEnvelope,
    },
    template: `
      <div class="p-1" style="max-height: 400px; width: 500px;">
        <seam-widget [icon]="icon" titleText="Example Widget" loading="false">
          <seam-widget-list-group>
            <seam-widget-list-group-item
              [icon]="itemIcon"
              [label]="label"
              [secondaryIcon]="secondaryIcon"
            ></seam-widget-list-group-item>
          </seam-widget-list-group>
        </seam-widget>
      </div>`,
  }),
  args: {
    itemIcon: 'fa-icon',
    secondaryIcon: 'img',
  },
  argTypes: {
    itemIcon: {
      options: Object.keys(iconLookup),
      mapping: iconLookup,
      control: { type: 'select' },
    },
    secondaryIcon: {
      options: Object.keys(iconLookup),
      mapping: iconLookup,
      control: { type: 'select' },
    },
  },
}

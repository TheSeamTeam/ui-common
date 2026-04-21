import { Meta, moduleMetadata, StoryObj } from '@storybook/angular'
import { fn } from 'storybook/test'

import { TheSeamFileDropZoneDirective } from './file-drop-zone.directive'

const meta: Meta<TheSeamFileDropZoneDirective> = {
  title: 'File Input/Directives/File Drop Zone',
  component: TheSeamFileDropZoneDirective,
  decorators: [moduleMetadata({ imports: [TheSeamFileDropZoneDirective] })],
  tags: ['autodocs'],
}
export default meta
type Story = StoryObj<TheSeamFileDropZoneDirective>

export const BasicUsage: Story = {
  render: () => ({
    props: { onDrop: fn(), onRejected: fn() },
    template: `
      <div
        style="padding:24px;border:1.5px dashed #ced4da;border-radius:6px;text-align:center"
        seamFileDropZone
        (seamFileDrop)="onDrop($event)"
        (seamFileDropRejected)="onRejected($event)">
        Drop files here
      </div>
    `,
  }),
}

export const LargeDropZone: Story = {
  render: () => ({
    props: { onDrop: fn() },
    template: `
      <div
        style="min-height:300px;display:flex;align-items:center;justify-content:center;
               border:1.5px dashed #ced4da;border-radius:8px;background:#fbfbfd"
        seamFileDropZone
        (seamFileDrop)="onDrop($event)">
        Anywhere in this big area is a drop target
      </div>
    `,
  }),
}

export const WithAccept: Story = {
  render: () => ({
    props: { onDrop: fn(), onRejected: fn() },
    template: `
      <div
        style="padding:24px;border:1.5px dashed #ced4da;border-radius:6px;text-align:center"
        seamFileDropZone
        accept="image/*"
        (seamFileDrop)="onDrop($event)"
        (seamFileDropRejected)="onRejected($event)">
        Images only
      </div>
    `,
  }),
}

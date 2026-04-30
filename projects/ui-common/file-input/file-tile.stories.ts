import { Meta, moduleMetadata, StoryObj } from '@storybook/angular'
import { fn } from 'storybook/test'

import { TheSeamFileTileComponent } from './file-tile.component'
import { SeamFileItem } from './file-item.models'
import { seamFileItemFromUrl } from './file-item.utils'

function fakeFile(name: string, type: string): File {
  return new File([new Uint8Array([137, 80, 78, 71])], name, { type })
}

const rowItem: SeamFileItem = {
  name: 'shipment-report-Q3.pdf',
  size: 847 * 1024,
  type: 'application/pdf',
  source: {
    kind: 'file',
    file: fakeFile('shipment-report-Q3.pdf', 'application/pdf'),
  },
}

const imageItem: SeamFileItem = {
  name: 'pic.png',
  size: 1234,
  type: 'image/png',
  source: { kind: 'file', file: fakeFile('pic.png', 'image/png') },
}

const serverItem = seamFileItemFromUrl(
  'https://placehold.co/300x200/4a90d9/ffffff?text=Server+Asset',
  {
    name: 'server-hosted.png',
    type: 'image/png',
    id: 'doc-42',
  },
)

const meta: Meta<TheSeamFileTileComponent> = {
  title: 'File Input/Components/File Tile',
  component: TheSeamFileTileComponent,
  decorators: [moduleMetadata({ imports: [TheSeamFileTileComponent] })],
  render: (args) => ({
    props: { ...args, remove: fn(), itemClick: fn() },
  }),
  tags: ['autodocs'],
}
export default meta
type Story = StoryObj<TheSeamFileTileComponent>

export const RowVariant: Story = { args: { item: rowItem } }

export const RowVariantNoMeta: Story = {
  args: { item: rowItem, showMeta: false },
}

export const PreviewVariant: Story = {
  args: { item: imageItem, variant: 'preview' },
}

export const PreviewVariantNoName: Story = {
  args: { item: imageItem, variant: 'preview', showName: false },
}

export const ClickableTile: Story = {
  args: { item: rowItem },
  render: (args) => ({
    props: { ...args, remove: fn(), itemClick: fn() },
    template: `<seam-file-tile [item]="item" (itemClick)="itemClick($event)" (remove)="remove($event)"></seam-file-tile>`,
  }),
}

export const NonRemovable: Story = {
  args: { item: rowItem, removable: false },
}

export const UrlSourceItem: Story = {
  args: { item: serverItem, variant: 'preview' },
}

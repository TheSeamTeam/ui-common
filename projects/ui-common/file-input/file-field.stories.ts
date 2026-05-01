import { FormControl, ReactiveFormsModule } from '@angular/forms'
import { Meta, moduleMetadata, StoryObj } from '@storybook/angular'
import { fn } from 'storybook/test'

import { TheSeamFileFieldComponent } from './file-field.component'
import { TheSeamFileInputComponent } from './file-input.component'
import { TheSeamFileTileComponent } from './file-tile.component'
import { SeamFileItem } from './file-item.models'
import { seamFileItemFromUrl } from './file-item.utils'

const meta: Meta<TheSeamFileFieldComponent> = {
  title: 'File Input/Components/File Field',
  component: TheSeamFileFieldComponent,
  decorators: [
    moduleMetadata({
      imports: [TheSeamFileFieldComponent, ReactiveFormsModule],
    }),
  ],
  tags: ['autodocs'],
}
export default meta
type Story = StoryObj<TheSeamFileFieldComponent>

export const SingleFile: Story = {
  render: () => {
    const ctrl = new FormControl<SeamFileItem[]>([])
    return {
      props: { ctrl, rejected: fn() },
      template: `<seam-file-field [formControl]="ctrl" (rejected)="rejected($event)"></seam-file-field>`,
    }
  },
}

export const SingleFilePreview: Story = {
  render: () => {
    const ctrl = new FormControl<SeamFileItem[]>([])
    return {
      props: { ctrl, rejected: fn() },
      template: `<seam-file-field
        [formControl]="ctrl"
        [previewMode]="true"
        accept="image/*"
        (rejected)="rejected($event)"></seam-file-field>`,
    }
  },
}

export const MultipleFiles: Story = {
  render: () => {
    const ctrl = new FormControl<SeamFileItem[]>([])
    return {
      props: { ctrl, rejected: fn() },
      template: `<seam-file-field
        [formControl]="ctrl"
        [multiple]="true"
        (rejected)="rejected($event)"></seam-file-field>`,
    }
  },
}

export const MultipleFilesPreview: Story = {
  render: () => {
    const ctrl = new FormControl<SeamFileItem[]>([])
    return {
      props: { ctrl, rejected: fn() },
      template: `<seam-file-field
        [formControl]="ctrl"
        [multiple]="true"
        [previewMode]="true"
        accept="image/*"
        (rejected)="rejected($event)"></seam-file-field>`,
    }
  },
}

export const MultipleFilesPreviewWithMaxFiles: Story = {
  render: () => {
    const ctrl = new FormControl<SeamFileItem[]>([])
    return {
      props: { ctrl, rejected: fn() },
      template: `<seam-file-field
        [formControl]="ctrl"
        [multiple]="true"
        [previewMode]="true"
        accept="image/*"
        [maxFiles]="4"
        (rejected)="rejected($event)"></seam-file-field>`,
    }
  },
}

export const EditFormWithExistingUrl: Story = {
  render: () => {
    const ctrl = new FormControl<SeamFileItem[]>([
      seamFileItemFromUrl(
        'https://placehold.co/300x200/4a90d9/ffffff?text=Current+Logo',
        {
          name: 'current-logo.png',
          type: 'image/png',
          id: 'existing',
        },
      ),
    ])
    return {
      props: { ctrl, rejected: fn() },
      template: `<seam-file-field
        [formControl]="ctrl"
        [previewMode]="true"
        accept="image/*"
        (rejected)="rejected($event)"></seam-file-field>`,
    }
  },
}

export const WithValidation: Story = {
  render: () => {
    const ctrl = new FormControl<SeamFileItem[]>([])
    return {
      props: { ctrl, rejected: fn() },
      template: `<seam-file-field
        [formControl]="ctrl"
        accept="image/*"
        [maxSize]="1048576"
        (rejected)="rejected($event)"></seam-file-field>`,
    }
  },
}

export const DisabledField: Story = {
  render: () => {
    const ctrl = new FormControl<SeamFileItem[]>([])
    ctrl.disable()
    return {
      props: { ctrl },
      template: `<seam-file-field [formControl]="ctrl"></seam-file-field>`,
    }
  },
}

export const CustomStateWithInputAndTile: Story = {
  decorators: [
    moduleMetadata({
      imports: [TheSeamFileInputComponent, TheSeamFileTileComponent],
    }),
  ],
  render: () => {
    const items: SeamFileItem[] = [
      seamFileItemFromUrl(
        'https://placehold.co/100x100/4a90d9/ffffff?text=Doc1',
        {
          name: 'existing-1.png',
          type: 'image/png',
        },
      ),
    ]
    return {
      props: { items, onFilesAdded: fn(), onRemove: fn() },
      template: `
        <seam-file-input [multiple]="true" (filesAdded)="onFilesAdded($event)"></seam-file-input>
        <div style="display:flex;flex-direction:column;gap:6px;margin-top:8px">
          @for (item of items; track item.id ?? item.name) {
            <seam-file-tile [item]="item" (remove)="onRemove($event)"></seam-file-tile>
          }
        </div>
      `,
    }
  },
}

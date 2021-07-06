import { Meta, moduleMetadata, Story } from '@storybook/angular'

import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms'
import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { QuillModule } from 'ngx-quill'

import { TheSeamSharedModule } from '@theseam/ui-common/shared'

import { TheSeamFormFieldComponent } from './../form-field.component'
import { TheSeamFormFieldModule } from './../form-field.module'

export default {
  title: 'Form Field/Components/Quill',
  component: TheSeamFormFieldComponent,
  decorators: [
    moduleMetadata({
      imports: [
        BrowserAnimationsModule,
        BrowserModule,
        ReactiveFormsModule,
        TheSeamFormFieldModule,
        TheSeamSharedModule,
        QuillModule.forRoot({
          theme: 'snow',
          modules: {
            toolbar: [
              ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
              ['blockquote'],

              // [{ 'header': 1 }, { 'header': 2 }],               // custom button values
              [{ 'list': 'ordered'}, { 'list': 'bullet' }],
              [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
              [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
              // [{ 'direction': 'rtl' }],                         // text direction

              [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
              [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

              [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
              // [{ 'font': [] }],
              [{ 'align': [] }],

              ['clean'],                                         // remove formatting button

              // ['link', 'image', 'video']                         // link and image, video
              ['link', 'image']                         // link and image, video
            ]
          }
        })
      ]
    })
  ],
  parameters: {
    docs: {
      iframeHeight: '600px',
    }
  }
} as Meta

export const Basic: Story = (args) => ({
  props: {
    ...args,
    control: new FormControl(undefined, [ Validators.required ])
  },
  template: `
    <seam-form-field label="Quill Editor:">
      <quill-editor
        seamInput
        [formControl]="control"
        [required]="true">
      </quill-editor>
      <ng-template seamFormFieldError="required">Body required.</ng-template>
    </seam-form-field>
  `
})

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuillModule } from 'ngx-quill';
import { RichTextComponent } from './rich-text/rich-text.component';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    RichTextComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    QuillModule
  ],
  exports: [
    RichTextComponent,
  ]
})
export class TheSeamRichTextModule { }

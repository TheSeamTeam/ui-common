import { NgModule } from '@angular/core'

import { RichTextComponent } from './rich-text/rich-text.component'

@NgModule({
  imports: [RichTextComponent],
  exports: [RichTextComponent],
})
export class TheSeamRichTextModule {}

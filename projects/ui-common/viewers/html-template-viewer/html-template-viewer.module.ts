import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'

import { TheSeamScrollbarModule } from '@theseam/ui-common/scrollbar'
import { TheSeamSharedModule } from '@theseam/ui-common/shared'

import { TheSeamHtmlTemplateViewerComponent } from './html-template-viewer.component'

@NgModule({
  imports: [
    CommonModule,
    TheSeamScrollbarModule,
    TheSeamSharedModule,
  ],
  declarations: [
    TheSeamHtmlTemplateViewerComponent,
  ],
  exports: [
    TheSeamHtmlTemplateViewerComponent,
  ]
})
export class TheSeamHtmlTemplateViewerModule { }

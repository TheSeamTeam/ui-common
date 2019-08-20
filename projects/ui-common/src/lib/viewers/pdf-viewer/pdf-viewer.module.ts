import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'

import { TheSeamSharedModule } from '../../shared/index'

import { PdfPageComponent } from './pdf-page/pdf-page.component'
import { PdfViewerComponent } from './pdf-viewer.component'

@NgModule({
  imports: [
    CommonModule,
    TheSeamSharedModule
  ],
  declarations: [
    PdfViewerComponent,
    PdfPageComponent
  ],
  exports: [
    PdfViewerComponent,
    PdfPageComponent
  ]
})
export class TheSeamPdfViewerModule { }

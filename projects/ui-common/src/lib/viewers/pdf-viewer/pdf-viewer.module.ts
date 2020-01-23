import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'

import { TheSeamSharedModule } from '../../shared/index'

import { TheSeamPdfPageComponent } from './pdf-page/pdf-page.component'
import { TheSeamPdfViewerComponent } from './pdf-viewer.component'

@NgModule({
  imports: [
    CommonModule,
    TheSeamSharedModule
  ],
  declarations: [
    TheSeamPdfViewerComponent,
    TheSeamPdfPageComponent
  ],
  exports: [
    TheSeamPdfViewerComponent,
    TheSeamPdfPageComponent
  ]
})
export class TheSeamPdfViewerModule { }

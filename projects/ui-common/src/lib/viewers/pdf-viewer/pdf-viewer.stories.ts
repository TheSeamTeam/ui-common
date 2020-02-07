import { moduleMetadata } from '@storybook/angular'

import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { TheSeamPdfViewerComponent } from './pdf-viewer.component'
import { TheSeamPdfViewerModule } from './pdf-viewer.module'

export default {
  title: 'Components/Viewers/Pdf',
  component: TheSeamPdfViewerComponent,
  decorators: [
    moduleMetadata({
      imports: [
        BrowserAnimationsModule,
        BrowserModule,
        TheSeamPdfViewerModule
      ]
    })
  ],
  parameters: {
    docs: {
      iframeHeight: '600px',
    }
  }
}

export const Basic = () => ({
  props: {
    pdfUrl: '/assets/ProducerCertificateSample.pdf',
    responsive: true,
    renderUpdateThreshold: 50
  },
  template: `
    <div class="p-2" style="max-width: 1200px;">
      <seam-pdf-viewer
        [pdfUrl]="pdfUrl"
        [responsive]="responsive"
        [renderUpdateThreshold]="renderUpdateThreshold">
      </seam-pdf-viewer>
    </div>
  `
})

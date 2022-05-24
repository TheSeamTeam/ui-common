import { moduleMetadata } from '@storybook/angular'

import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { TheSeamHtmlTemplateViewerComponent } from './html-template-viewer.component'
import { TheSeamHtmlTemplateViewerModule } from './html-template-viewer.module'

export default {
  title: 'Viewers/Components/HTML Template',
  // component: TheSeamHtmlTemplateViewerComponent,
  decorators: [
    moduleMetadata({
      imports: [
        BrowserAnimationsModule,
        BrowserModule,
        TheSeamHtmlTemplateViewerModule
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
    src: 'http://localhost:8080/views/peanuts/TrustedRepresentativeAgreement.html',
    dataVersion: 2,
    scrollable: true,
    data: {
      signature: undefined,
      organization: 'Some Organization',
      jobTitle: 'Does Stuff',
    }
  },
  template: `
    <div class="p-2" style="max-width: 1200px;">
      <seam-html-template-viewer
        [src]="src"
        [dataVersion]="dataVersion"
        [scrollable]="scrollable"
        [data]="data">
      </seam-html-template-viewer>
    </div>
  `
})

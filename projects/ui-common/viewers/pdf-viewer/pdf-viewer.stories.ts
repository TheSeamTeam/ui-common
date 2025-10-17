import { componentWrapperDecorator, Meta, StoryObj } from '@storybook/angular'

import { TheSeamPdfViewerComponent } from './pdf-viewer.component'

interface ExtraArgs {}

type StoryComponentType = TheSeamPdfViewerComponent & ExtraArgs

const meta: Meta<StoryComponentType> = {
  title: 'Viewers/Pdf',
  component: TheSeamPdfViewerComponent,
  decorators: [
    componentWrapperDecorator(
      (story) => `<div style="max-width: 1200px">${story}</div>`,
    ),
  ],
  parameters: {
    docs: {
      iframeHeight: '600px',
    },
  },
}

export default meta
type Story = StoryObj<StoryComponentType>

export const Basic: Story = {
  args: {
    pdfUrl: '/assets/ProducerCertificateSample.pdf',
    responsive: true,
    renderUpdateThreshold: 50,
  },
}

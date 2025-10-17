import { componentWrapperDecorator, Meta, StoryObj } from '@storybook/angular'

import { TheSeamHtmlTemplateViewerComponent } from './html-template-viewer.component'

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface ExtraArgs {}

type StoryComponentType = TheSeamHtmlTemplateViewerComponent & ExtraArgs

const meta: Meta<StoryComponentType> = {
  title: 'Viewers/HTML Template',
  component: TheSeamHtmlTemplateViewerComponent,
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
    src: 'http://localhost:8080/views/peanuts/TrustedRepresentativeAgreement.html',
    dataVersion: 2,
    scrollable: true,
    data: {
      signature: undefined,
      organization: 'Some Organization',
      jobTitle: 'Does Stuff',
    },
  },
}

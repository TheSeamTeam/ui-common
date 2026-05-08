import { Component, Inject } from '@angular/core'
import { NgForOf } from '@angular/common'
import {
  applicationConfig,
  componentWrapperDecorator,
  Meta,
  moduleMetadata,
  StoryObj,
} from '@storybook/angular'
import { expect } from 'storybook/test'
import { provideAnimations } from '@angular/platform-browser/animations'
import { provideMarkdown } from 'ngx-markdown'

import { getHarness } from '@theseam/ui-common/testing'

import { MockAiProvider } from '../providers/mock.ai-provider'
import { THESEAM_CHAT_PROVIDER } from './chat-provider'
import { THESEAM_CHAT_BLOCK_REGISTRY } from './chat-block-registry'
import { TheSeamChatComponent } from './chat.component'
import { TheSeamChatHarness } from './testing/chat.harness'

@Component({
  selector: 'story-table-block',
  imports: [NgForOf],
  template: `
    <table class="table table-sm table-bordered mt-2 mb-2">
      <thead>
        <tr>
          <th *ngFor="let col of _parsed.columns">{{ col }}</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let row of _parsed.rows">
          <td *ngFor="let cell of row">{{ cell }}</td>
        </tr>
      </tbody>
    </table>
  `,
})
class StoryTableBlockComponent {
  _parsed: { columns: string[]; rows: string[][] } = { columns: [], rows: [] }

  constructor(@Inject('CHAT_BLOCK_CONTENT') content: string) {
    try {
      this._parsed = JSON.parse(content)
    } catch {
      this._parsed = { columns: ['Error'], rows: [['Invalid JSON']] }
    }
  }
}

const meta: Meta<TheSeamChatComponent> = {
  title: 'AI/Chat',
  tags: ['autodocs'],
  component: TheSeamChatComponent,
  decorators: [
    applicationConfig({
      providers: [provideAnimations(), provideMarkdown()],
    }),
    componentWrapperDecorator(
      (story) =>
        `<div style="height: 500px; width: 600px; border: 1px solid #dee2e6; border-radius: 4px;">${story}</div>`,
    ),
  ],
}

export default meta
type Story = StoryObj<TheSeamChatComponent>

export const BasicChat: Story = {
  decorators: [
    applicationConfig({
      providers: [
        {
          provide: THESEAM_CHAT_PROVIDER,
          useValue: new MockAiProvider(
            'Cotton prices are holding steady at $0.72 per pound this season. Current warehouse inventory shows 1,240 bales ready for delivery.',
          ),
        },
      ],
    }),
  ],
  args: {
    placeholder: 'Ask about cotton prices...',
  },
}

export const MarkdownResponse: Story = {
  decorators: [
    applicationConfig({
      providers: [
        {
          provide: THESEAM_CHAT_PROVIDER,
          useValue: new MockAiProvider(
            `## Cotton Bale Summary — Spring Harvest

| Field | Bales | Avg Weight (lbs) | Grade |
|-------|-------|------------------|-------|
| North 40 | 312 | 480 | 41-3 |
| South Creek | 198 | 475 | 31-3 |
| East Bottoms | 267 | 491 | 41-4 |

**Total bales:** 777 | **Est. value:** $266,343

> Grades reflect USDA micronaire and strength readings from ginning.

_Next delivery window: April 18–22_`,
          ),
        },
      ],
    }),
  ],
  args: {
    placeholder: 'Ask for a bale summary...',
  },
}

export const CustomBlocks: Story = {
  decorators: [
    applicationConfig({
      providers: [
        {
          provide: THESEAM_CHAT_PROVIDER,
          useValue: new MockAiProvider(
            `Here are the recent peanut loads received at the buying point:

\`\`\`seam-table
${JSON.stringify({
  columns: ['Load #', 'Grower', 'Net Weight (lbs)', 'Grade', 'Value'],
  rows: [
    ['PNT-1041', 'Hargrove Farm', '44,820', 'No. 1', '$14,342'],
    ['PNT-1042', 'Tanner Acres', '42,150', 'No. 1', '$13,488'],
    ['PNT-1043', 'Riverside Peanuts', '46,990', 'No. 2', '$13,146'],
    ['PNT-1044', 'Red Clay Farm', '43,600', 'No. 1', '$13,952'],
  ],
})}
\`\`\`

All loads have been inspected and are awaiting sheller pickup.`,
          ),
        },
        {
          provide: THESEAM_CHAT_BLOCK_REGISTRY,
          useValue: new Map([['seam-table', StoryTableBlockComponent]]),
        },
      ],
    }),
    moduleMetadata({
      imports: [StoryTableBlockComponent],
    }),
  ],
  args: {
    placeholder: 'Ask about peanut loads...',
  },
}

export const ConversationHistory: Story = {
  decorators: [
    applicationConfig({
      providers: [
        {
          provide: THESEAM_CHAT_PROVIDER,
          useValue: new MockAiProvider(
            'Cotton futures are up 2.3% today. The December contract is trading at $0.74/lb on the ICE exchange.',
          ),
        },
      ],
    }),
  ],
  args: {
    placeholder: 'Ask about cotton markets...',
  },
  play: async ({ canvasElement }) => {
    const harness = await getHarness(TheSeamChatHarness, { canvasElement })
    const messages = await harness.getMessages()
    await expect(messages).toHaveLength(0)
    const input = await harness.getInput()
    await expect(input).toBeTruthy()
  },
}

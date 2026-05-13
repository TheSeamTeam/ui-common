import { Component, Inject, signal } from '@angular/core'
import { NgForOf } from '@angular/common'
import {
  applicationConfig,
  componentWrapperDecorator,
  Meta,
  moduleMetadata,
  StoryObj,
} from '@storybook/angular'
import { expect, waitFor } from 'storybook/test'
import { provideAnimations } from '@angular/platform-browser/animations'
import { provideMarkdown } from 'ngx-markdown'

import { getHarness } from '@theseam/ui-common/testing'

import { ChatSession, ChatSessionStaleError } from '../providers/ai-provider'
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

const _historySession: ChatSession = {
  uid: 'demo-session-1',
  label: 'Cotton bale conversation',
  created: '2026-05-13T08:00:00Z',
  lastActivity: '2026-05-13T08:00:30Z',
  leafMessageId: 'm2',
  messages: [
    {
      uid: 'm1',
      role: 'user',
      content: 'How many bales did we receive last week?',
      created: '2026-05-13T08:00:00Z',
    },
    {
      uid: 'm2',
      role: 'assistant',
      content:
        '777 bales were received across the three buying points. The North 40 led with 312 bales.',
      created: '2026-05-13T08:00:30Z',
    },
  ],
}

export const WithInitialSession: Story = {
  decorators: [
    applicationConfig({
      providers: [
        {
          provide: THESEAM_CHAT_PROVIDER,
          useValue: new MockAiProvider({
            response: 'OK!',
            initialSession: _historySession,
            delayMs: 800,
          }),
        },
      ],
    }),
  ],
  args: { placeholder: 'Continue the conversation...' },
  play: async ({ canvasElement }) => {
    const harness = await getHarness(TheSeamChatHarness, { canvasElement })
    await waitFor(
      async () => {
        const messages = await harness.getMessages()
        expect(messages).toHaveLength(2)
      },
      { timeout: 2000 },
    )
  },
}

export const StaleLeafRecovery: Story = {
  decorators: [
    applicationConfig({
      providers: [
        {
          provide: THESEAM_CHAT_PROVIDER,
          useValue: new MockAiProvider({
            response: 'never gets sent — stale recovery replaces history',
            initialSession: _historySession,
            sessionsByUid: new Map([
              [
                _historySession.uid,
                {
                  ..._historySession,
                  leafMessageId: 'm3-from-other-tab',
                  messages: [
                    ..._historySession.messages,
                    {
                      uid: 'm3-from-other-tab',
                      role: 'assistant',
                      content:
                        'Update from another tab: 778 bales (one was recounted).',
                      created: '2026-05-13T08:01:00Z',
                    },
                  ],
                },
              ],
            ]),
            throwOnFirstChat: new ChatSessionStaleError(
              _historySession.uid,
              'm3-from-other-tab',
            ),
          }),
        },
      ],
    }),
  ],
  args: { placeholder: 'Try sending — server will report stale' },
  play: async ({ canvasElement }) => {
    const harness = await getHarness(TheSeamChatHarness, { canvasElement })
    const input = await harness.getInput()
    // Manual play: open the story and click Send after typing. The history
    // should refresh and your text should reappear in the input.
    await expect(input).toBeTruthy()
  },
}

export const NewSessionFlow: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div style="display: flex; flex-direction: column; gap: 8px; height: 100%;">
        <button (click)="chat.newSession()" style="align-self: flex-start; padding: 4px 12px;">
          New Session
        </button>
        <seam-chat #chat [placeholder]="placeholder" style="flex: 1;"></seam-chat>
      </div>
    `,
  }),
  decorators: [
    applicationConfig({
      providers: [
        {
          provide: THESEAM_CHAT_PROVIDER,
          useValue: new MockAiProvider({
            response: 'OK',
            initialSession: _historySession,
          }),
        },
      ],
    }),
  ],
  args: { placeholder: 'Say something or click New Session...' },
}

export const SessionSwitch: Story = {
  render: (args) => ({
    props: {
      ...args,
      sessionId: signal<string | null>(null),
      switchTo: (
        uid: string | null,
        sessionId: ReturnType<typeof signal<string | null>>,
      ) => sessionId.set(uid),
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 8px; height: 100%;">
        <div style="display: flex; gap: 8px;">
          <button (click)="switchTo('demo-session-1', sessionId)">Load A</button>
          <button (click)="switchTo('demo-session-2', sessionId)">Load B</button>
          <button (click)="switchTo(null, sessionId)">Clear</button>
        </div>
        <seam-chat [sessionId]="sessionId()" [placeholder]="placeholder" style="flex: 1;"></seam-chat>
      </div>
    `,
  }),
  decorators: [
    applicationConfig({
      providers: [
        {
          provide: THESEAM_CHAT_PROVIDER,
          useValue: (() => {
            const a: ChatSession = {
              ..._historySession,
              uid: 'demo-session-1',
              label: 'A',
            }
            const b: ChatSession = {
              ..._historySession,
              uid: 'demo-session-2',
              label: 'B',
              messages: [
                {
                  uid: 'b1',
                  role: 'user',
                  content: 'Different session content',
                  created: '2026-05-13T08:00:00Z',
                },
              ],
              leafMessageId: 'b1',
            }
            return new MockAiProvider({
              response: 'OK',
              sessionsByUid: new Map([
                ['demo-session-1', a],
                ['demo-session-2', b],
              ]),
            })
          })(),
        },
      ],
    }),
  ],
  args: { placeholder: 'Pick a session above...' },
}

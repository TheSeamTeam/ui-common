# AI Chat Component Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a chat component to `projects/ui-common/ai/chat/` and extract the AI provider layer into a shared `providers/` directory.

**Architecture:** Shared `AiProvider` interface in `ai/providers/` consumed by both the existing datatable-prompter and the new chat component through separate injection tokens. The chat uses `ngx-markdown` for response rendering and supports custom block renderers via a registry.

**Tech Stack:** Angular 20, ngx-markdown (marked), Jest, Storybook 9, CDK ComponentHarness, RxJS

---

## File Map

### New Files

| File | Responsibility |
|---|---|
| `projects/ui-common/ai/providers/ai-provider.ts` | `AiProvider` interface, `ChatMessage`, `ChatResponse` types |
| `projects/ui-common/ai/providers/lm-studio.ai-provider.ts` | LM Studio provider implementing `AiProvider` |
| `projects/ui-common/ai/providers/openrouter.ai-provider.ts` | OpenRouter provider implementing `AiProvider` |
| `projects/ui-common/ai/providers/mock.ai-provider.ts` | Configurable mock provider for tests/stories |
| `projects/ui-common/ai/chat/chat.component.ts` | Container component: message list + input |
| `projects/ui-common/ai/chat/chat.component.html` | Chat container template |
| `projects/ui-common/ai/chat/chat.component.scss` | Chat container styles |
| `projects/ui-common/ai/chat/chat-message.component.ts` | Single message bubble with Markdown + custom blocks |
| `projects/ui-common/ai/chat/chat-input.component.ts` | Input wrapper around RichTextComponent |
| `projects/ui-common/ai/chat/chat-provider.ts` | `THESEAM_CHAT_PROVIDER` injection token |
| `projects/ui-common/ai/chat/chat-response-parser.ts` | Pure function: splits response into segments |
| `projects/ui-common/ai/chat/chat-block-registry.ts` | `THESEAM_CHAT_BLOCK_REGISTRY` injection token + types |
| `projects/ui-common/ai/chat/chat-response-parser.spec.ts` | Jest tests for the parser |
| `projects/ui-common/ai/chat/chat.component.spec.ts` | Jest tests for the chat component |
| `projects/ui-common/ai/chat/chat.stories.ts` | Storybook stories (living documentation) |
| `projects/ui-common/ai/chat/testing/chat.harness.ts` | CDK ComponentHarness for the chat |

### Modified Files

| File | Change |
|---|---|
| `package.json` | Add `ngx-markdown` + `marked` dependencies |
| `projects/ui-common/ai/public-api.ts` | Export all public symbols |
| `projects/ui-common/ai/datatable-prompter/datatable-prompter-prompt-provider.ts` | Retype token to `AiProvider`, remove old interface |
| `projects/ui-common/ai/datatable-prompter/datatable-prompter.component.ts` | Update provider call to use `AiProvider.chat()` |
| `projects/ui-common/ai/datatable-prompter/datatable-prompter.stories.ts` | Import `MockAiProvider` from shared location |
| `projects/ui-common/jest.config.ts` | Add `**/ai/**/*.spec.ts` to testMatch |

### Deleted Files

| File | Reason |
|---|---|
| `projects/ui-common/ai/datatable-prompter/ai-providers/lm-studio.ai-provider.ts` | Moved to `ai/providers/` |
| `projects/ui-common/ai/datatable-prompter/ai-providers/openrouter.ai-provider.ts` | Moved to `ai/providers/` |

---

### Task 1: Install ngx-markdown dependency

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install ngx-markdown and marked**

```bash
npm install ngx-markdown marked --legacy-peer-deps
```

- [ ] **Step 2: Verify installation**

```bash
node -e "require('ngx-markdown/package.json').version"
node -e "require('marked/package.json').version"
```

Expected: version numbers printed without errors.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add ngx-markdown and marked dependencies"
```

---

### Task 2: Create shared AiProvider interface and types

**Files:**
- Create: `projects/ui-common/ai/providers/ai-provider.ts`

- [ ] **Step 1: Write the types file**

```typescript
// projects/ui-common/ai/providers/ai-provider.ts

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ChatResponse {
  content: string
}

export interface AiProvider {
  chat(messages: ChatMessage[]): Promise<ChatResponse>
}
```

- [ ] **Step 2: Verify the file compiles**

```bash
npx tsc --noEmit --project projects/ui-common/tsconfig.lib.json 2>&1 | head -20
```

Expected: No errors related to `ai/providers/ai-provider.ts`.

- [ ] **Step 3: Commit**

```bash
git add projects/ui-common/ai/providers/ai-provider.ts
git commit -m "feat(ai): add shared AiProvider interface and message types"
```

---

### Task 3: Move and refactor LM Studio provider

**Files:**
- Create: `projects/ui-common/ai/providers/lm-studio.ai-provider.ts`
- Delete: `projects/ui-common/ai/datatable-prompter/ai-providers/lm-studio.ai-provider.ts`

- [ ] **Step 1: Create the new provider file**

```typescript
// projects/ui-common/ai/providers/lm-studio.ai-provider.ts
import { AiProvider, ChatMessage, ChatResponse } from './ai-provider'

export class LmStudioAiProvider implements AiProvider {
  async chat(messages: ChatMessage[]): Promise<ChatResponse> {
    const url = 'http://localhost:1234/v1/chat/completions'
    const headers = {
      'Content-Type': 'application/json',
    }
    const model = 'model-identifier'

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
      }),
    })

    const data = await response.json()
    console.log('Response from AI:', data)

    const content = data.choices[0].message.content
    console.log(
      `%cResponse from AI. content:\n${content}`,
      'color: limegreen;',
    )

    return { content }
  }
}
```

- [ ] **Step 2: Delete the old file**

```bash
rm projects/ui-common/ai/datatable-prompter/ai-providers/lm-studio.ai-provider.ts
```

- [ ] **Step 3: Commit**

```bash
git add projects/ui-common/ai/providers/lm-studio.ai-provider.ts
git add projects/ui-common/ai/datatable-prompter/ai-providers/lm-studio.ai-provider.ts
git commit -m "refactor(ai): move LM Studio provider to shared providers directory"
```

---

### Task 4: Move and refactor OpenRouter provider

**Files:**
- Create: `projects/ui-common/ai/providers/openrouter.ai-provider.ts`
- Delete: `projects/ui-common/ai/datatable-prompter/ai-providers/openrouter.ai-provider.ts`

- [ ] **Step 1: Create the new provider file**

```typescript
// projects/ui-common/ai/providers/openrouter.ai-provider.ts
import { AiProvider, ChatMessage, ChatResponse } from './ai-provider'

export class OpenRouterAiProvider implements AiProvider {
  async chat(messages: ChatMessage[]): Promise<ChatResponse> {
    const defaultApiKey =
      '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'

    const url = 'https://openrouter.ai/api/v1/chat/completions'
    const apiKey = localStorage.getItem('openrouter-api-key') || defaultApiKey
    const headers = {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    }
    const model = 'google/gemini-2.5-flash'

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
        response_format: { type: 'json_object' },
      }),
    })

    const data = await response.json()
    console.log('Response from AI:', data)

    const content = data.choices[0].message.content
    console.log(
      `%cResponse from AI. content:\n${content}`,
      'color: limegreen;',
    )

    return { content }
  }
}
```

- [ ] **Step 2: Delete the old file and remove the empty directory**

```bash
rm projects/ui-common/ai/datatable-prompter/ai-providers/openrouter.ai-provider.ts
rmdir projects/ui-common/ai/datatable-prompter/ai-providers
```

- [ ] **Step 3: Commit**

```bash
git add projects/ui-common/ai/providers/openrouter.ai-provider.ts
git add projects/ui-common/ai/datatable-prompter/ai-providers/openrouter.ai-provider.ts
git commit -m "refactor(ai): move OpenRouter provider to shared providers directory"
```

---

### Task 5: Create shared configurable MockAiProvider

**Files:**
- Create: `projects/ui-common/ai/providers/mock.ai-provider.ts`

- [ ] **Step 1: Create the mock provider**

```typescript
// projects/ui-common/ai/providers/mock.ai-provider.ts
import { AiProvider, ChatMessage, ChatResponse } from './ai-provider'

type MockResponse = string | ((messages: ChatMessage[]) => string)

export class MockAiProvider implements AiProvider {
  constructor(private readonly _response: MockResponse = 'Mock response') {}

  async chat(messages: ChatMessage[]): Promise<ChatResponse> {
    const content =
      typeof this._response === 'function'
        ? this._response(messages)
        : this._response
    return { content }
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add projects/ui-common/ai/providers/mock.ai-provider.ts
git commit -m "feat(ai): add configurable MockAiProvider for tests and stories"
```

---

### Task 6: Update datatable-prompter to use AiProvider interface

**Files:**
- Modify: `projects/ui-common/ai/datatable-prompter/datatable-prompter-prompt-provider.ts`
- Modify: `projects/ui-common/ai/datatable-prompter/datatable-prompter.component.ts`
- Modify: `projects/ui-common/ai/datatable-prompter/datatable-prompter.stories.ts`

- [ ] **Step 1: Update the prompt provider file**

In `projects/ui-common/ai/datatable-prompter/datatable-prompter-prompt-provider.ts`, replace the `TheSeamDatatablePrompterProvider` interface and injection token (lines 298-305) with a token typed to `AiProvider`. Also remove the dead `submitPrompt()` function (lines 307-380).

Replace lines 1 and 298-380 with:

```typescript
// Line 1: add AiProvider import
import { InjectionToken } from '@angular/core'
import { AiProvider } from '../providers/ai-provider'

// ... (assistantPrompt, getUserPrompt, parseResponse stay exactly as-is) ...

// Replace the old interface and token (lines 298-305) with:
export const THESEAM_DATATABLE_PROMPTER_PROVIDER =
  new InjectionToken<AiProvider>('TheSeamDatatablePrompterProvider')

// Delete the submitPrompt() function (lines 307-380) entirely — it's dead code.
```

Keep `assistantPrompt`, `getUserPrompt`, and `parseResponse` unchanged.

- [ ] **Step 2: Update the datatable-prompter component**

In `projects/ui-common/ai/datatable-prompter/datatable-prompter.component.ts`, update the import (line 38-41) and the `_onSubmit()` method to construct messages and call `chat()` instead of `submit()`.

Replace the import:

```typescript
// lines 38-41: replace with
import {
  assistantPrompt,
  getUserPrompt,
  parseResponse,
  THESEAM_DATATABLE_PROMPTER_PROVIDER,
} from './datatable-prompter-prompt-provider'
```

In `_onSubmit()`, replace lines 225-227 (the `this._aiProvider.submit(userPrompt)` call):

```typescript
    // Old: this._aiProvider.submit(userPrompt)
    // New: construct messages array and call chat()
    this._aiProvider
      .chat([
        { role: 'system', content: assistantPrompt },
        { role: 'user', content: userPrompt },
      ])
      .then(async (response) => {
        const alterations = parseResponse(response.content, undefined)
```

And update the rest of the `.then` chain — the `alterations` variable now comes from parsing `response.content` instead of being the raw return value. The body of the callback after `const alterations = ...` stays the same.

- [ ] **Step 3: Update the stories**

In `projects/ui-common/ai/datatable-prompter/datatable-prompter.stories.ts`:

Replace the MockAiProvider import and class (lines 26-91):

```typescript
// Remove these imports (lines 26-29):
// import { THESEAM_DATATABLE_PROMPTER_PROVIDER, TheSeamDatatablePrompterProvider } from './datatable-prompter-prompt-provider'
// import { OpenRouterAiProvider } from './ai-providers/openrouter.ai-provider'

// Replace with:
import { THESEAM_DATATABLE_PROMPTER_PROVIDER } from './datatable-prompter-prompt-provider'
import { MockAiProvider } from '../providers/mock.ai-provider'
```

Remove the inline `MockAiProvider` class (lines 76-91) entirely — it's now imported from shared.

Update the provider in the decorator (line 255-258):

```typescript
        {
          provide: THESEAM_DATATABLE_PROMPTER_PROVIDER,
          useValue: new MockAiProvider(
            JSON.stringify([
              {
                id: 'filter--age',
                type: 'filter',
                state: {
                  columnProp: 'age',
                  filterType: 'text',
                  operation: 'eq',
                  value: '33',
                },
              },
            ]),
          ),
        },
```

Note: The old `MockAiProvider.submit()` returned a parsed object directly. The new `MockAiProvider.chat()` returns `{ content: string }`, so the content needs to be a JSON string. The datatable-prompter component now calls `parseResponse(response.content, undefined)` which handles parsing.

- [ ] **Step 4: Verify the build compiles**

```bash
npx ng build ui-common 2>&1 | tail -5
```

Expected: Build succeeds.

- [ ] **Step 5: Commit**

```bash
git add projects/ui-common/ai/datatable-prompter/datatable-prompter-prompt-provider.ts
git add projects/ui-common/ai/datatable-prompter/datatable-prompter.component.ts
git add projects/ui-common/ai/datatable-prompter/datatable-prompter.stories.ts
git commit -m "refactor(ai): update datatable-prompter to use shared AiProvider interface"
```

---

### Task 7: Write failing tests for chat-response-parser

**Files:**
- Create: `projects/ui-common/ai/chat/chat-response-parser.spec.ts`

- [ ] **Step 1: Write the test file**

```typescript
// projects/ui-common/ai/chat/chat-response-parser.spec.ts
import { parseChatResponse, ChatContentSegment } from './chat-response-parser'

describe('parseChatResponse', () => {
  it('should return a single markdown segment for plain text', () => {
    const result = parseChatResponse('Hello, world!')
    expect(result).toEqual([{ type: 'markdown', content: 'Hello, world!' }])
  })

  it('should return a single markdown segment for standard fenced blocks', () => {
    const input = 'Here is code:\n\n```json\n{"key": "value"}\n```\n\nDone.'
    const result = parseChatResponse(input)
    expect(result).toEqual([
      { type: 'markdown', content: input },
    ])
  })

  it('should extract a seam- prefixed block as a custom-block segment', () => {
    const input =
      'Here is data:\n\n```seam-table\n{"columns":["A"],"rows":[["1"]]}\n```\n\nEnd.'
    const result = parseChatResponse(input)
    expect(result).toEqual([
      { type: 'markdown', content: 'Here is data:\n\n' },
      {
        type: 'custom-block',
        tag: 'seam-table',
        content: '{"columns":["A"],"rows":[["1"]]}',
      },
      { type: 'markdown', content: '\n\nEnd.' },
    ])
  })

  it('should handle multiple custom blocks', () => {
    const input =
      'Table:\n\n```seam-table\ntable-data\n```\n\nChart:\n\n```seam-chart\nchart-data\n```\n\nDone.'
    const result = parseChatResponse(input)
    expect(result).toEqual([
      { type: 'markdown', content: 'Table:\n\n' },
      { type: 'custom-block', tag: 'seam-table', content: 'table-data' },
      { type: 'markdown', content: '\n\nChart:\n\n' },
      { type: 'custom-block', tag: 'seam-chart', content: 'chart-data' },
      { type: 'markdown', content: '\n\nDone.' },
    ])
  })

  it('should handle a custom block with no surrounding text', () => {
    const input = '```seam-table\ndata\n```'
    const result = parseChatResponse(input)
    expect(result).toEqual([
      { type: 'custom-block', tag: 'seam-table', content: 'data' },
    ])
  })

  it('should return an empty array for an empty string', () => {
    const result = parseChatResponse('')
    expect(result).toEqual([])
  })

  it('should handle a custom block with empty content', () => {
    const input = '```seam-table\n\n```'
    const result = parseChatResponse(input)
    expect(result).toEqual([
      { type: 'custom-block', tag: 'seam-table', content: '' },
    ])
  })

  it('should not treat seam- blocks inside standard blocks as custom', () => {
    const input = '```typescript\nconst x = `seam-table`\n```'
    const result = parseChatResponse(input)
    expect(result).toEqual([{ type: 'markdown', content: input }])
  })
})
```

- [ ] **Step 2: Add ai to jest testMatch**

In `projects/ui-common/jest.config.ts`, add to the `testMatch` array:

```typescript
    '**/ai/**/*.spec.ts',
```

- [ ] **Step 3: Run tests to verify they fail**

```bash
npx jest --config projects/ui-common/jest.config.ts --testPathPattern="chat-response-parser" --no-coverage 2>&1 | tail -10
```

Expected: FAIL — `Cannot find module './chat-response-parser'`

- [ ] **Step 4: Commit**

```bash
git add projects/ui-common/ai/chat/chat-response-parser.spec.ts
git add projects/ui-common/jest.config.ts
git commit -m "test(ai): add failing tests for chat response parser"
```

---

### Task 8: Implement chat-response-parser

**Files:**
- Create: `projects/ui-common/ai/chat/chat-response-parser.ts`

- [ ] **Step 1: Write the parser**

```typescript
// projects/ui-common/ai/chat/chat-response-parser.ts

export type ChatContentSegment =
  | { type: 'markdown'; content: string }
  | { type: 'custom-block'; tag: string; content: string }

/**
 * Splits a raw AI response string into an ordered array of segments.
 * Fenced code blocks with `seam-` prefixed language tags become custom-block
 * segments; everything else stays as markdown.
 */
export function parseChatResponse(input: string): ChatContentSegment[] {
  if (!input) {
    return []
  }

  const segments: ChatContentSegment[] = []
  // Matches ``` at the start of a line, followed by seam-<tag>, content, then closing ```
  const pattern = /^```(seam-[\w-]+)\n([\s\S]*?)^```/gm

  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = pattern.exec(input)) !== null) {
    // Add any markdown content before this match
    if (match.index > lastIndex) {
      segments.push({ type: 'markdown', content: input.slice(lastIndex, match.index) })
    }

    segments.push({
      type: 'custom-block',
      tag: match[1],
      content: match[2].replace(/\n$/, ''),
    })

    lastIndex = match.index + match[0].length
  }

  // Add any remaining markdown after the last match
  if (lastIndex < input.length) {
    segments.push({ type: 'markdown', content: input.slice(lastIndex) })
  }

  return segments
}
```

- [ ] **Step 2: Run tests to verify they pass**

```bash
npx jest --config projects/ui-common/jest.config.ts --testPathPattern="chat-response-parser" --no-coverage 2>&1 | tail -15
```

Expected: All 8 tests PASS.

- [ ] **Step 3: Commit**

```bash
git add projects/ui-common/ai/chat/chat-response-parser.ts
git commit -m "feat(ai): implement chat response parser"
```

---

### Task 9: Create chat injection tokens and block registry

**Files:**
- Create: `projects/ui-common/ai/chat/chat-provider.ts`
- Create: `projects/ui-common/ai/chat/chat-block-registry.ts`

- [ ] **Step 1: Create the chat provider token**

```typescript
// projects/ui-common/ai/chat/chat-provider.ts
import { InjectionToken } from '@angular/core'
import { AiProvider } from '../providers/ai-provider'

export const THESEAM_CHAT_PROVIDER = new InjectionToken<AiProvider>(
  'TheSeamChatProvider',
)
```

- [ ] **Step 2: Create the block registry token**

```typescript
// projects/ui-common/ai/chat/chat-block-registry.ts
import { InjectionToken, Type } from '@angular/core'

export type ChatBlockRegistry = Map<string, Type<unknown>>

export const THESEAM_CHAT_BLOCK_REGISTRY =
  new InjectionToken<ChatBlockRegistry>('TheSeamChatBlockRegistry')
```

- [ ] **Step 3: Commit**

```bash
git add projects/ui-common/ai/chat/chat-provider.ts
git add projects/ui-common/ai/chat/chat-block-registry.ts
git commit -m "feat(ai): add chat provider and block registry injection tokens"
```

---

### Task 10: Create chat-input component

**Files:**
- Create: `projects/ui-common/ai/chat/chat-input.component.ts`

- [ ] **Step 1: Write the component**

```typescript
// projects/ui-common/ai/chat/chat-input.component.ts
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core'
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms'

import { TheSeamRichTextModule } from '@theseam/ui-common/rich-text'
import { TheSeamFormFieldModule } from '@theseam/ui-common/form-field'
import { TheSeamButtonsModule } from '@theseam/ui-common/buttons'

@Component({
  selector: 'seam-chat-input',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TheSeamRichTextModule,
    TheSeamFormFieldModule,
    TheSeamButtonsModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="seam-chat-input">
      <seam-form-field>
        <seam-rich-text
          [formControl]="_control"
          [placeholder]="placeholder"
          [disableRichText]="true"
          [rows]="2"
          (keydown.enter)="_onEnterKey($event)"
        ></seam-rich-text>
      </seam-form-field>
      <button
        seamButton
        theme="primary"
        class="seam-chat-send-btn"
        [disabled]="disabled || _control.invalid"
        (click)="_onSend()"
      >
        Send
      </button>
    </div>
  `,
  styles: [
    `
      .seam-chat-input {
        display: flex;
        align-items: flex-end;
        gap: 8px;
        padding: 8px;
        border-top: 1px solid #dee2e6;
      }

      seam-form-field {
        flex: 1;
      }

      .seam-chat-send-btn {
        flex-shrink: 0;
      }
    `,
  ],
})
export class SeamChatInputComponent {
  @Input() placeholder = 'Type a message...'
  @Input() disabled = false

  @Output() messageSent = new EventEmitter<string>()

  readonly _control = new FormControl<string>('', [Validators.required])

  _onEnterKey(event: Event) {
    const keyEvent = event as KeyboardEvent
    if (keyEvent.shiftKey) {
      return // allow Shift+Enter for newline
    }
    keyEvent.preventDefault()
    this._onSend()
  }

  _onSend() {
    const value = this._control.value?.trim()
    if (!value || this.disabled) {
      return
    }
    this.messageSent.emit(value)
    this._control.reset()
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add projects/ui-common/ai/chat/chat-input.component.ts
git commit -m "feat(ai): add chat input component"
```

---

### Task 11: Create chat-message component

**Files:**
- Create: `projects/ui-common/ai/chat/chat-message.component.ts`

- [ ] **Step 1: Write the component**

```typescript
// projects/ui-common/ai/chat/chat-message.component.ts
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Input,
  Injector,
} from '@angular/core'
import { NgComponentOutlet, NgForOf, NgIf } from '@angular/common'
import { MarkdownComponent } from 'ngx-markdown'

import { ChatContentSegment } from './chat-response-parser'
import {
  ChatBlockRegistry,
  THESEAM_CHAT_BLOCK_REGISTRY,
} from './chat-block-registry'

export interface ChatMessageDisplayModel {
  role: 'user' | 'assistant'
  segments: ChatContentSegment[]
  timestamp: Date
}

@Component({
  selector: 'seam-chat-message',
  standalone: true,
  imports: [NgForOf, NgIf, MarkdownComponent, NgComponentOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="seam-chat-message"
      [class.seam-chat-message--user]="message.role === 'user'"
      [class.seam-chat-message--assistant]="message.role === 'assistant'"
    >
      <div class="seam-chat-message__role">
        {{ message.role === 'user' ? 'You' : 'Assistant' }}
      </div>
      <div class="seam-chat-message__content">
        <ng-container *ngFor="let segment of message.segments">
          <markdown
            *ngIf="segment.type === 'markdown'"
            [data]="segment.content"
          ></markdown>
          <ng-container *ngIf="segment.type === 'custom-block'">
            <ng-container
              *ngIf="_getBlockComponent(segment.tag) as blockComponent; else fallbackBlock"
            >
              <ng-container
                *ngComponentOutlet="blockComponent; injector: _createBlockInjector(segment.content)"
              ></ng-container>
            </ng-container>
            <ng-template #fallbackBlock>
              <markdown [data]="'```' + segment.tag + '\n' + segment.content + '\n```'"></markdown>
            </ng-template>
          </ng-container>
        </ng-container>
      </div>
    </div>
  `,
  styles: [
    `
      .seam-chat-message {
        display: flex;
        flex-direction: column;
        padding: 8px 12px;
        margin-bottom: 8px;
      }

      .seam-chat-message--user {
        align-items: flex-end;
      }

      .seam-chat-message--user .seam-chat-message__content {
        background-color: #e8f5e9;
        border-radius: 8px;
        padding: 8px 12px;
        max-width: 80%;
      }

      .seam-chat-message--assistant .seam-chat-message__content {
        background-color: #f1f3f5;
        border-radius: 8px;
        padding: 8px 12px;
        max-width: 80%;
      }

      .seam-chat-message__role {
        font-size: 0.75rem;
        color: #6c757d;
        margin-bottom: 4px;
      }
    `,
  ],
})
export class SeamChatMessageComponent {
  @Input({ required: true }) message!: ChatMessageDisplayModel

  private readonly _blockRegistry = inject(THESEAM_CHAT_BLOCK_REGISTRY, {
    optional: true,
  })
  private readonly _injector = inject(Injector)

  _getBlockComponent(tag: string) {
    return this._blockRegistry?.get(tag) ?? null
  }

  _createBlockInjector(content: string): Injector {
    return Injector.create({
      providers: [{ provide: 'CHAT_BLOCK_CONTENT', useValue: content }],
      parent: this._injector,
    })
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add projects/ui-common/ai/chat/chat-message.component.ts
git commit -m "feat(ai): add chat message component with markdown and custom block rendering"
```

---

### Task 12: Create main chat container component

**Files:**
- Create: `projects/ui-common/ai/chat/chat.component.ts`
- Create: `projects/ui-common/ai/chat/chat.component.html`
- Create: `projects/ui-common/ai/chat/chat.component.scss`

- [ ] **Step 1: Write the template**

```html
<!-- projects/ui-common/ai/chat/chat.component.html -->
<div class="seam-chat">
  <div class="seam-chat__messages" #messageList>
    <seam-chat-message
      *ngFor="let msg of _displayMessages"
      [message]="msg"
    ></seam-chat-message>

    <div *ngIf="_loadingSubject | async" class="seam-chat__loading">
      <span>Thinking...</span>
    </div>
  </div>

  <seam-chat-input
    [placeholder]="placeholder"
    [disabled]="!!(_loadingSubject | async)"
    (messageSent)="_onMessageSent($event)"
  ></seam-chat-input>
</div>
```

- [ ] **Step 2: Write the styles**

```scss
// projects/ui-common/ai/chat/chat.component.scss
:host {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.seam-chat {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.seam-chat__messages {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.seam-chat__loading {
  padding: 8px 12px;
  color: #6c757d;
  font-style: italic;
}
```

- [ ] **Step 3: Write the component class**

```typescript
// projects/ui-common/ai/chat/chat.component.ts
import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  Input,
  ViewChild,
} from '@angular/core'
import { AsyncPipe, NgForOf, NgIf } from '@angular/common'
import { BehaviorSubject } from 'rxjs'

import { ChatMessage } from '../providers/ai-provider'
import { THESEAM_CHAT_PROVIDER } from './chat-provider'
import { parseChatResponse } from './chat-response-parser'
import {
  ChatMessageDisplayModel,
  SeamChatMessageComponent,
} from './chat-message.component'
import { SeamChatInputComponent } from './chat-input.component'

@Component({
  selector: 'seam-chat',
  standalone: true,
  imports: [
    AsyncPipe,
    NgForOf,
    NgIf,
    SeamChatMessageComponent,
    SeamChatInputComponent,
  ],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TheSeamChatComponent implements AfterViewChecked {
  private readonly _provider = inject(THESEAM_CHAT_PROVIDER, { optional: true })
  private readonly _cdr = inject(ChangeDetectorRef)

  @Input() systemPrompt = ''
  @Input() placeholder = 'Type a message...'

  @ViewChild('messageList') private _messageList?: ElementRef<HTMLElement>

  readonly _loadingSubject = new BehaviorSubject<boolean>(false)

  private _messages: ChatMessage[] = []
  _displayMessages: ChatMessageDisplayModel[] = []
  private _shouldScroll = false

  ngAfterViewChecked() {
    if (this._shouldScroll) {
      this._scrollToBottom()
      this._shouldScroll = false
    }
  }

  async _onMessageSent(text: string) {
    if (this._loadingSubject.value || !this._provider) {
      if (!this._provider) {
        console.error('No chat provider configured.')
      }
      return
    }

    // Add user message
    const userMessage: ChatMessage = { role: 'user', content: text }
    this._messages.push(userMessage)
    this._displayMessages = [
      ...this._displayMessages,
      {
        role: 'user',
        segments: [{ type: 'markdown', content: text }],
        timestamp: new Date(),
      },
    ]
    this._shouldScroll = true
    this._cdr.markForCheck()

    // Call provider
    this._loadingSubject.next(true)
    try {
      const messagesToSend: ChatMessage[] = []
      if (this.systemPrompt) {
        messagesToSend.push({ role: 'system', content: this.systemPrompt })
      }
      messagesToSend.push(...this._messages)

      const response = await this._provider.chat(messagesToSend)

      // Add assistant message
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.content,
      }
      this._messages.push(assistantMessage)
      this._displayMessages = [
        ...this._displayMessages,
        {
          role: 'assistant',
          segments: parseChatResponse(response.content),
          timestamp: new Date(),
        },
      ]
      this._shouldScroll = true
    } catch (err) {
      console.error('Chat provider error:', err)
    } finally {
      this._loadingSubject.next(false)
      this._cdr.markForCheck()
    }
  }

  private _scrollToBottom() {
    const el = this._messageList?.nativeElement
    if (el) {
      el.scrollTop = el.scrollHeight
    }
  }
}
```

- [ ] **Step 4: Verify the build compiles**

```bash
npx ng build ui-common 2>&1 | tail -5
```

Expected: Build succeeds.

- [ ] **Step 5: Commit**

```bash
git add projects/ui-common/ai/chat/chat.component.ts
git add projects/ui-common/ai/chat/chat.component.html
git add projects/ui-common/ai/chat/chat.component.scss
git commit -m "feat(ai): add main chat container component"
```

---

### Task 13: Create test harness

**Files:**
- Create: `projects/ui-common/ai/chat/testing/chat.harness.ts`

- [ ] **Step 1: Write the harness**

```typescript
// projects/ui-common/ai/chat/testing/chat.harness.ts
import { ComponentHarness, HarnessPredicate } from '@angular/cdk/testing'

export class TheSeamChatMessageHarness extends ComponentHarness {
  static hostSelector = 'seam-chat-message'

  async getRole(): Promise<string> {
    const el = await this.host()
    const roleEl = await el.querySelector('.seam-chat-message__role')
    const text = await roleEl?.text()
    return text?.trim().toLowerCase() ?? ''
  }

  async getText(): Promise<string> {
    const el = await this.host()
    const contentEl = await el.querySelector('.seam-chat-message__content')
    return (await contentEl?.text())?.trim() ?? ''
  }

  async hasCustomBlocks(): Promise<boolean> {
    const el = await this.host()
    const blocks = await el.querySelectorAll('[data-chat-block]')
    return blocks.length > 0
  }
}

export class TheSeamChatInputHarness extends ComponentHarness {
  static hostSelector = 'seam-chat-input'

  async getSendButton() {
    return this.locatorFor('button')()
  }

  async isSendDisabled(): Promise<boolean> {
    const btn = await this.getSendButton()
    return (await btn.getAttribute('disabled')) !== null
  }
}

export class TheSeamChatHarness extends ComponentHarness {
  static hostSelector = 'seam-chat'

  private readonly _messages = this.locatorForAll(TheSeamChatMessageHarness)
  private readonly _input = this.locatorFor(TheSeamChatInputHarness)

  async getMessages(): Promise<TheSeamChatMessageHarness[]> {
    return this._messages()
  }

  async getInput(): Promise<TheSeamChatInputHarness> {
    return this._input()
  }

  async isLoading(): Promise<boolean> {
    const host = await this.host()
    const loadingEl = await host.querySelector('.seam-chat__loading')
    return loadingEl !== null
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add projects/ui-common/ai/chat/testing/chat.harness.ts
git commit -m "feat(ai): add chat CDK test harness"
```

---

### Task 14: Write chat component Jest tests

**Files:**
- Create: `projects/ui-common/ai/chat/chat.component.spec.ts`

- [ ] **Step 1: Write the test file**

```typescript
// projects/ui-common/ai/chat/chat.component.spec.ts
import { TestBed } from '@angular/core/testing'
import { provideMarkdown } from 'ngx-markdown'

import { AiProvider, ChatMessage, ChatResponse } from '../providers/ai-provider'
import { THESEAM_CHAT_PROVIDER } from './chat-provider'
import { TheSeamChatComponent } from './chat.component'

class SpyAiProvider implements AiProvider {
  lastMessages: ChatMessage[] = []
  response = 'Test response'

  async chat(messages: ChatMessage[]): Promise<ChatResponse> {
    this.lastMessages = messages
    return { content: this.response }
  }
}

describe('TheSeamChatComponent', () => {
  let provider: SpyAiProvider

  beforeEach(() => {
    provider = new SpyAiProvider()
    TestBed.configureTestingModule({
      imports: [TheSeamChatComponent],
      providers: [
        provideMarkdown(),
        { provide: THESEAM_CHAT_PROVIDER, useValue: provider },
      ],
    })
  })

  it('should create with no messages', () => {
    const fixture = TestBed.createComponent(TheSeamChatComponent)
    fixture.detectChanges()
    expect(fixture.componentInstance).toBeTruthy()
    expect(fixture.componentInstance._displayMessages).toEqual([])
  })

  it('should add user message on send', async () => {
    const fixture = TestBed.createComponent(TheSeamChatComponent)
    fixture.detectChanges()

    await fixture.componentInstance._onMessageSent('Hello')
    fixture.detectChanges()

    expect(fixture.componentInstance._displayMessages.length).toBe(2)
    expect(fixture.componentInstance._displayMessages[0].role).toBe('user')
    expect(fixture.componentInstance._displayMessages[1].role).toBe('assistant')
  })

  it('should prepend system prompt when provided', async () => {
    const fixture = TestBed.createComponent(TheSeamChatComponent)
    fixture.componentInstance.systemPrompt = 'You are helpful.'
    fixture.detectChanges()

    await fixture.componentInstance._onMessageSent('Hi')

    expect(provider.lastMessages[0]).toEqual({
      role: 'system',
      content: 'You are helpful.',
    })
    expect(provider.lastMessages[1]).toEqual({
      role: 'user',
      content: 'Hi',
    })
  })

  it('should not prepend system prompt when empty', async () => {
    const fixture = TestBed.createComponent(TheSeamChatComponent)
    fixture.detectChanges()

    await fixture.componentInstance._onMessageSent('Hi')

    expect(provider.lastMessages.length).toBe(1)
    expect(provider.lastMessages[0].role).toBe('user')
  })

  it('should track loading state', async () => {
    let resolveChat: (value: ChatResponse) => void
    provider.chat = (messages) => {
      provider.lastMessages = messages
      return new Promise((resolve) => {
        resolveChat = resolve
      })
    }

    const fixture = TestBed.createComponent(TheSeamChatComponent)
    fixture.detectChanges()

    const sendPromise = fixture.componentInstance._onMessageSent('Hello')
    expect(fixture.componentInstance._loadingSubject.value).toBe(true)

    resolveChat!({ content: 'Response' })
    await sendPromise

    expect(fixture.componentInstance._loadingSubject.value).toBe(false)
  })
})
```

- [ ] **Step 2: Run the tests**

```bash
npx jest --config projects/ui-common/jest.config.ts --testPathPattern="chat.component.spec" --no-coverage 2>&1 | tail -15
```

Expected: All tests PASS.

- [ ] **Step 3: Commit**

```bash
git add projects/ui-common/ai/chat/chat.component.spec.ts
git commit -m "test(ai): add chat component unit tests"
```

---

### Task 15: Write Storybook stories

**Files:**
- Create: `projects/ui-common/ai/chat/chat.stories.ts`

- [ ] **Step 1: Write the stories file**

```typescript
// projects/ui-common/ai/chat/chat.stories.ts
import {
  applicationConfig,
  componentWrapperDecorator,
  Meta,
  moduleMetadata,
  StoryObj,
} from '@storybook/angular'
import { expect } from 'storybook/test'
import { provideAnimations } from '@angular/platform-browser/animations'
import { Component, Inject } from '@angular/core'
import { provideMarkdown } from 'ngx-markdown'

import { getHarness } from '@theseam/ui-common/testing'

import { NgForOf } from '@angular/common'
import { AiProvider, ChatMessage, ChatResponse } from '../providers/ai-provider'
import { MockAiProvider } from '../providers/mock.ai-provider'
import { THESEAM_CHAT_PROVIDER } from './chat-provider'
import {
  ChatBlockRegistry,
  THESEAM_CHAT_BLOCK_REGISTRY,
} from './chat-block-registry'
import { TheSeamChatComponent } from './chat.component'
import { TheSeamChatHarness } from './testing/chat.harness'

// --- Example custom block component for the CustomBlocks story ---

@Component({
  selector: 'story-table-block',
  standalone: true,
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
  imports: [NgForOf],
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

// --- Stories ---

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

/**
 * Basic chat with a mock provider that returns plain text.
 * Demonstrates the minimal setup: provide `THESEAM_CHAT_PROVIDER` and render `seam-chat`.
 */
export const BasicChat: Story = {
  decorators: [
    applicationConfig({
      providers: [
        {
          provide: THESEAM_CHAT_PROVIDER,
          useValue: new MockAiProvider('Hello! How can I help you today?'),
        },
      ],
    }),
  ],
  args: {
    placeholder: 'Ask me anything...',
  },
}

/**
 * Chat with a system prompt. The MockAiProvider echoes the messages it receives
 * so you can verify the system prompt is included in the request.
 */
export const WithSystemPrompt: Story = {
  decorators: [
    applicationConfig({
      providers: [
        {
          provide: THESEAM_CHAT_PROVIDER,
          useValue: new MockAiProvider(
            (messages: ChatMessage[]) =>
              `I received ${messages.length} messages. System prompt: "${messages[0]?.content ?? 'none'}"`,
          ),
        },
      ],
    }),
  ],
  args: {
    systemPrompt: 'You are a helpful assistant for TheSeam applications.',
    placeholder: 'Type a message...',
  },
}

/**
 * Chat where the assistant responds with Markdown formatting.
 * Demonstrates heading, bold, list, and code block rendering.
 */
export const MarkdownResponse: Story = {
  decorators: [
    applicationConfig({
      providers: [
        {
          provide: THESEAM_CHAT_PROVIDER,
          useValue: new MockAiProvider(
            [
              '## Sales Summary',
              '',
              'Here are the **key findings**:',
              '',
              '- Revenue is **up 15%** this quarter',
              '- Top region: *Southeast*',
              '- Lowest performer: *Northwest*',
              '',
              '```json',
              '{ "total": 1250000, "growth": 0.15 }',
              '```',
              '',
              'Let me know if you need more details.',
            ].join('\n'),
          ),
        },
      ],
    }),
  ],
  args: {
    placeholder: 'Ask about sales data...',
  },
}

/**
 * Chat with a custom block renderer registered for `seam-table`.
 * Demonstrates how to provide a `THESEAM_CHAT_BLOCK_REGISTRY` with a custom
 * component that renders structured data from a fenced code block.
 */
export const CustomBlocks: Story = {
  decorators: [
    applicationConfig({
      providers: [
        {
          provide: THESEAM_CHAT_PROVIDER,
          useValue: new MockAiProvider(
            [
              "Here's the data you requested:",
              '',
              '```seam-table',
              JSON.stringify({
                columns: ['Region', 'Q1 Revenue', 'Q2 Revenue'],
                rows: [
                  ['North', '$42,000', '$51,000'],
                  ['South', '$38,000', '$44,000'],
                  ['East', '$55,000', '$62,000'],
                ],
              }),
              '```',
              '',
              'Would you like to see this as a chart instead?',
            ].join('\n'),
          ),
        },
        {
          provide: THESEAM_CHAT_BLOCK_REGISTRY,
          useValue: new Map([['seam-table', StoryTableBlockComponent]]),
        },
      ],
    }),
  ],
  args: {
    placeholder: 'Ask about revenue data...',
  },
}

/**
 * Demonstrates a multi-turn conversation using a play function.
 * The MockAiProvider uses a function to return different responses
 * based on the conversation length.
 */
export const ConversationHistory: Story = {
  decorators: [
    applicationConfig({
      providers: [
        {
          provide: THESEAM_CHAT_PROVIDER,
          useValue: new MockAiProvider((messages: ChatMessage[]) => {
            const userMessages = messages.filter((m) => m.role === 'user')
            switch (userMessages.length) {
              case 1:
                return 'I can help with that! What data range are you interested in?'
              case 2:
                return 'Here are the results for that period. The total is **$1.25M**.'
              default:
                return `You've asked ${userMessages.length} questions so far. Keep going!`
            }
          }),
        },
      ],
    }),
  ],
  args: {
    systemPrompt: 'You are a data analyst assistant.',
    placeholder: 'Ask a question...',
  },
  play: async ({ canvasElement }) => {
    const harness = await getHarness(TheSeamChatHarness, { canvasElement })

    // Verify starts empty
    let messages = await harness.getMessages()
    await expect(messages).toHaveLength(0)

    // Note: Full send-message interaction requires typing into the RichText
    // input, which needs the full Quill editor initialized. The harness
    // verifies the structural elements are present and the component is wired.
    const input = await harness.getInput()
    await expect(input).toBeTruthy()
  },
}
```

- [ ] **Step 2: Commit**

```bash
git add projects/ui-common/ai/chat/chat.stories.ts
git commit -m "feat(ai): add chat Storybook stories with usage examples"
```

---

### Task 16: Update public API and verify build

**Files:**
- Modify: `projects/ui-common/ai/public-api.ts`

- [ ] **Step 1: Update the public API exports**

Replace the contents of `projects/ui-common/ai/public-api.ts`:

```typescript
// projects/ui-common/ai/public-api.ts

// Shared providers
export { AiProvider, ChatMessage, ChatResponse } from './providers/ai-provider'
export { LmStudioAiProvider } from './providers/lm-studio.ai-provider'
export { OpenRouterAiProvider } from './providers/openrouter.ai-provider'
export { MockAiProvider } from './providers/mock.ai-provider'

// Chat
export { TheSeamChatComponent } from './chat/chat.component'
export { THESEAM_CHAT_PROVIDER } from './chat/chat-provider'
export {
  ChatBlockRegistry,
  THESEAM_CHAT_BLOCK_REGISTRY,
} from './chat/chat-block-registry'
export { ChatContentSegment, parseChatResponse } from './chat/chat-response-parser'
export { TheSeamChatHarness } from './chat/testing/chat.harness'

// Datatable prompter
export {
  THESEAM_DATATABLE_PROMPTER_PROVIDER,
  assistantPrompt,
  getUserPrompt,
  parseResponse,
} from './datatable-prompter/datatable-prompter-prompt-provider'
export { TheSeamDatatablePrompterComponent } from './datatable-prompter/datatable-prompter.component'
```

- [ ] **Step 2: Run the full library build**

```bash
npx ng build ui-common 2>&1 | tail -10
```

Expected: Build succeeds.

- [ ] **Step 3: Run all tests**

```bash
npx jest --config projects/ui-common/jest.config.ts --testPathPattern="ai/" --no-coverage 2>&1 | tail -15
```

Expected: All chat and parser tests pass.

- [ ] **Step 4: Commit**

```bash
git add projects/ui-common/ai/public-api.ts
git commit -m "feat(ai): update public API exports for providers, chat, and datatable-prompter"
```

---

### Task 17: Final verification

- [ ] **Step 1: Run the full test suite**

```bash
npm run test:ci 2>&1 | tail -20
```

Expected: All tests pass, including the new `ai/` tests.

- [ ] **Step 2: Run lint**

```bash
npm run lint 2>&1 | tail -20
```

Expected: No lint errors in new files.

- [ ] **Step 3: Verify Storybook compiles** (if Storybook is running)

```bash
npm run build-storybook 2>&1 | tail -10
```

Expected: Build succeeds. Stories should be visible under `AI/Chat/` in Storybook.

- [ ] **Step 4: Manual Storybook check**

Open Storybook and verify:
1. `AI/Chat/BasicChat` — renders chat, can type and send a message, sees a response
2. `AI/Chat/MarkdownResponse` — response has headings, bold, list, code block
3. `AI/Chat/CustomBlocks` — response includes a rendered HTML table from the `seam-table` block
4. `AI/Chat/ConversationHistory` — play function runs without errors
5. `AI/DatatablePrompter/Basic` — still works correctly with the refactored provider

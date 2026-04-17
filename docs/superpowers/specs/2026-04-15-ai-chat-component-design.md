# AI Chat Component Design

**Date:** 2026-04-15
**Status:** Draft
**Scope:** Add a chat component to `projects/ui-common/ai/`, refactor shared AI provider layer

## Context

The AI chat component is a proof-of-concept for demoing to customers and gathering feedback on what they'd want from a chat integration in TheSeam applications. After demos and feedback, the team will decide whether to continue with this custom implementation or adopt a self-hosted chat solution.

The existing `datatable-prompter` feature already has AI provider infrastructure (`TheSeamDatatablePrompterProvider`, LM Studio and OpenRouter implementations). This design extracts the provider layer into a shared module and adds a chat component that reuses it.

## Architecture: Shared Provider, Separate Features

Both the chat and datatable-prompter consume the same `AiProvider` interface through their own injection tokens. Each feature owns its domain-specific logic (prompt construction, response parsing). The shared layer handles API communication only.

### Module Structure

```
projects/ui-common/ai/
  providers/                          # Shared AI provider layer
    ai-provider.ts                    # AiProvider interface, ChatMessage, ChatResponse
    lm-studio.ai-provider.ts          # Moved from datatable-prompter/ai-providers/
    openrouter.ai-provider.ts         # Moved from datatable-prompter/ai-providers/
    mock.ai-provider.ts               # Extracted from stories, configurable response

  chat/                               # New chat feature
    chat.component.ts                 # Container: message list + input
    chat.component.html
    chat.component.scss
    chat-message.component.ts         # Single message: markdown + custom blocks
    chat-input.component.ts           # Wraps RichTextComponent + send button
    chat-provider.ts                  # THESEAM_CHAT_PROVIDER injection token
    chat-response-parser.ts           # Splits markdown + fenced blocks into segments
    chat-block-registry.ts            # Maps language tags -> Angular components
    testing/
      chat.harness.ts                 # CDK ComponentHarness
    chat.component.spec.ts
    chat-response-parser.spec.ts
    chat.stories.ts

  datatable-prompter/                 # Mostly unchanged
    datatable-prompter.component.ts   # No changes
    datatable-prompter-prompt-provider.ts  # Token retyped to AiProvider
    datatable-prompter.stories.ts     # Uses shared MockAiProvider
    ai-providers/                     # Deleted (moved to providers/)

  ng-package.json
  public-api.ts
```

## Shared Provider Interface

```typescript
interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface ChatResponse {
  content: string
}

interface AiProvider {
  chat(messages: ChatMessage[]): Promise<ChatResponse>
}
```

The existing LM Studio and OpenRouter providers are refactored to implement this interface. They become thin API wrappers — no domain-specific system prompts baked in. The datatable-prompter constructs its full messages array (system prompt + user prompt) before calling the provider.

Both features have their own injection tokens typed to `AiProvider`:
- `THESEAM_DATATABLE_PROMPTER_PROVIDER` (existing, retyped)
- `THESEAM_CHAT_PROVIDER` (new)

This allows consuming apps to wire different provider instances to different features, or point them at the same one.

## Chat Component Design

### `seam-chat` (Container)

Standalone component, `ChangeDetectionStrategy.OnPush`.

**Inputs:**
- `systemPrompt: string` — prepended to messages array as a system message
- `placeholder: string` — placeholder text for the input

**Behavior:**
- Manages full `ChatMessage[]` history in memory
- On submit: appends user message, calls provider with full history, appends assistant response
- Tracks loading state via `BehaviorSubject<boolean>`
- Auto-scrolls message list to bottom on new messages
- Fills its container (flexible layout — consuming app controls placement via full page, side panel, popover, etc.)

### `seam-chat-message` (Message Bubble)

Internal sub-component.

**Input:** Display model with role, parsed content segments, timestamp.

**Rendering by role:**
- `user` messages: plain text, right-aligned
- `assistant` messages: iterates content segments — Markdown segments rendered via `ngx-markdown`, custom block segments rendered via `NgComponentOutlet` using the block registry. Left-aligned.

### `seam-chat-input`

Internal sub-component. Wraps `RichTextComponent` with `disableRichText: true` (consistent with datatable-prompter). Send button. Submit on Enter, Shift+Enter for newline. Disabled while loading.

**Output:** `(messageSent)` event with text content.

## Response Rendering & Custom Blocks

### Segment Model

```typescript
type ChatContentSegment =
  | { type: 'markdown'; content: string }
  | { type: 'custom-block'; tag: string; content: string }
```

### Response Parser

`parseChatResponse(content: string): ChatContentSegment[]`

Pure function. Splits raw AI response on fenced code blocks with `seam-` prefixed language tags. Standard fenced blocks (`json`, `typescript`, etc.) pass through as Markdown.

**Example:**

Input:
````
Here's the sales data:

```seam-table
{"columns": ["Region", "Q1", "Q2"], "rows": [["North", "$42k", "$51k"]]}
```

Let me know if you'd like a chart view.
````

Output:
```typescript
[
  { type: 'markdown', content: "Here's the sales data:\n" },
  { type: 'custom-block', tag: 'seam-table', content: '{"columns": ...}' },
  { type: 'markdown', content: '\nLet me know if you\'d like a chart view.' },
]
```

### Block Registry

Injection token `THESEAM_CHAT_BLOCK_REGISTRY` — a `Map<string, Type<Component>>`.

- Consuming apps provide entries mapping language tags to Angular components
- Default registry is empty — unregistered tags fall back to Markdown code blocks
- Custom block components receive the `content` string as an input

### PoC Example Block

A `SeamChatTableBlockComponent` is included in stories (not exported) to demonstrate the custom block feature end-to-end. Takes JSON with `columns` and `rows`, renders a basic HTML table.

## Datatable Prompter Changes

Minimal changes to the existing feature:

1. `THESEAM_DATATABLE_PROMPTER_PROVIDER` retyped from `TheSeamDatatablePrompterProvider` to `AiProvider`
2. `datatable-prompter.component.ts` updated to construct the full messages array (system message with `assistantPrompt` + user message) before calling `provider.chat(messages)`
3. `parseResponse()` and `getUserPrompt()` stay in `datatable-prompter-prompt-provider.ts` — they are datatable-specific
4. `ai-providers/` directory deleted (providers moved to `ai/providers/`)
5. Stories updated to import `MockAiProvider` from shared location

## New Dependency

- `ngx-markdown` — wraps `marked` for rendering Markdown in chat responses

## Public API

### Exported from `ai/public-api.ts`

**From `providers/`:**
- `AiProvider`, `ChatMessage`, `ChatResponse`
- `LmStudioAiProvider`, `OpenRouterAiProvider`, `MockAiProvider` (accepts a configurable response — string, function, or array — so stories/tests can control what it returns)

**From `chat/`:**
- `TheSeamChatComponent`
- `THESEAM_CHAT_PROVIDER`
- `THESEAM_CHAT_BLOCK_REGISTRY`
- `ChatContentSegment`
- `TheSeamChatHarness`
- `parseChatResponse`

**From `datatable-prompter/` (unchanged except retyped token):**
- All current exports

**Not exported (internal):**
- `SeamChatMessageComponent`, `SeamChatInputComponent`
- `SeamChatTableBlockComponent` (stories only)

## Testing

### Jest Specs

**`chat-response-parser.spec.ts`:**
- Plain Markdown with no fenced blocks
- Single custom block (`seam-table`)
- Mixed content (Markdown + custom block + Markdown)
- Standard fenced blocks (`json`, `typescript`) pass through as Markdown
- Edge cases: empty response, block with no content, multiple custom blocks

**`chat.component.spec.ts`:**
- Renders with no messages
- Sends a message, verifies it appears in the list
- Loading state while waiting for provider response
- Assistant response renders after provider resolves
- System prompt prepended to messages sent to provider

### Storybook Stories

Each story serves as a usage example / living documentation:

| Story | Demonstrates |
|---|---|
| **BasicChat** | Minimal setup — MockAiProvider returns plain text. Shows how to wire up the component with a provider. |
| **WithSystemPrompt** | Passes a `systemPrompt` input. MockAiProvider echoes what it received to verify system prompt inclusion. |
| **MarkdownResponse** | MockAiProvider returns Markdown (headings, lists, bold, code blocks). Demonstrates Markdown rendering. |
| **CustomBlocks** | MockAiProvider returns a response with a `seam-table` block. Registers a table renderer in the block registry. Shows how to provide custom renderers. |
| **ConversationHistory** | `play` function sends multiple messages in sequence. Demonstrates conversation flow and history building. |

### Test Harness (`TheSeamChatHarness`)

CDK `ComponentHarness`, works in TestBed and Storybook (via `@marklb/storybook-harness`):

- `getMessages()` — returns message harnesses
- `getInput()` — returns input harness
- `sendMessage(text: string)` — types text and clicks send
- `isLoading()` — checks loading state
- Message harness: `getRole()`, `getText()`, `getCustomBlocks()`

Play functions in Storybook use the harness for interactions.

## Future Considerations (Not In Scope)

These are noted for context but explicitly excluded from this implementation:

- **Streaming responses** — token-by-token display (switch provider return type to `Observable`)
- **`HttpClient` integration** — use Angular's HttpClient instead of `fetch` for interceptor/auth support
- **Chat + datatable integration** — chat component aware of datatable state on the same page
- **Quill plugins** — rich-text input plugins for formatted questions or data attachment
- **Production markdown features** — syntax highlighting (Prism.js), LaTeX, mermaid diagrams

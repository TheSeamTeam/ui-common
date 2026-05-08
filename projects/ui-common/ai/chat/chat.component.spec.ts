import {
  ChatMessage,
  ChatResponse,
  TheSeamAiChatRequest,
  TheSeamAiProvider,
} from '../providers/ai-provider'
import { TheSeamChatContext } from '../chat-context'
import { TheSeamChatContextRegistry } from '../chat-context-registry.service'
import { parseChatResponse } from './chat-response-parser'

class FakeAiProvider implements TheSeamAiProvider {
  lastRequest: TheSeamAiChatRequest | undefined
  response = 'Test response'

  async chat(request: TheSeamAiChatRequest): Promise<ChatResponse> {
    this.lastRequest = request
    return { content: this.response }
  }
}

/**
 * Simulates _onMessageSent logic from TheSeamChatComponent without
 * requiring Angular TestBed + Quill dependencies. The structure must
 * match the runtime component's send path (see chat.component.ts).
 */
function makeSimulator(
  provider: FakeAiProvider,
  registry?: TheSeamChatContextRegistry,
) {
  const messages: ChatMessage[] = []

  return {
    messages,
    async send(text: string) {
      const userMessage: ChatMessage = { role: 'user', content: text }
      messages.push(userMessage)

      const contexts = (await registry?.snapshot()) ?? []
      const response = await provider.chat({
        messages: [...messages],
        contexts: contexts.length === 0 ? undefined : contexts,
      })
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.content,
      }
      messages.push(assistantMessage)
      return {
        messages: [...messages],
        segments: parseChatResponse(response.content),
      }
    },
  }
}

describe('TheSeamChatComponent (logic)', () => {
  let provider: FakeAiProvider

  beforeEach(() => {
    provider = new FakeAiProvider()
  })

  it('starts with no messages', () => {
    const sim = makeSimulator(provider)
    expect(sim.messages).toEqual([])
  })

  it('appends user and assistant messages on send', async () => {
    const sim = makeSimulator(provider)

    const result = await sim.send('Hello')

    expect(result.messages.length).toBe(2)
    expect(result.messages[0].role).toBe('user')
    expect(result.messages[1].role).toBe('assistant')
  })

  it('sends only user/assistant turns, no system role', async () => {
    const sim = makeSimulator(provider)

    await sim.send('Hi')

    expect(
      provider.lastRequest!.messages.every((m) => m.role !== ('system' as any)),
    ).toBe(true)
  })

  it('omits the contexts field when no registry is provided', async () => {
    const sim = makeSimulator(provider)

    await sim.send('Hi')

    expect(provider.lastRequest!.contexts).toBeUndefined()
  })

  it('omits the contexts field when registry is empty', async () => {
    const registry = new TheSeamChatContextRegistry()
    const sim = makeSimulator(provider, registry)

    await sim.send('Hi')

    expect(provider.lastRequest!.contexts).toBeUndefined()
  })

  it('forwards a snapshot of registered contexts', async () => {
    const registry = new TheSeamChatContextRegistry()
    const ctx: TheSeamChatContext = {
      type: 'datatable',
      getContext: () => ({ label: 'Bales' }),
    }
    registry.register(ctx)
    const sim = makeSimulator(provider, registry)

    await sim.send('How many?')

    expect(provider.lastRequest!.contexts).toEqual([
      { type: 'datatable', data: { label: 'Bales' } },
    ])
  })

  it('sends full history on subsequent messages', async () => {
    const sim = makeSimulator(provider)

    await sim.send('First')
    await sim.send('Second')

    expect(provider.lastRequest!.messages.length).toBe(3)
    expect(provider.lastRequest!.messages[0]).toEqual({
      role: 'user',
      content: 'First',
    })
    expect(provider.lastRequest!.messages[1]).toEqual({
      role: 'assistant',
      content: 'Test response',
    })
    expect(provider.lastRequest!.messages[2]).toEqual({
      role: 'user',
      content: 'Second',
    })
  })

  it('parses response into segments', async () => {
    provider.response = 'Hello **world**'
    const sim = makeSimulator(provider)

    const result = await sim.send('Hi')

    expect(result.segments).toEqual([
      { type: 'markdown', content: 'Hello **world**' },
    ])
  })
})

import { AiProvider, ChatMessage, ChatResponse } from '../providers/ai-provider'
import { THESEAM_CHAT_PROVIDER } from './chat-provider'
import { parseChatResponse } from './chat-response-parser'

class SpyAiProvider implements AiProvider {
  lastMessages: ChatMessage[] = []
  response = 'Test response'

  async chat(messages: ChatMessage[]): Promise<ChatResponse> {
    this.lastMessages = messages
    return { content: this.response }
  }
}

/**
 * Tests the chat component logic without rendering, to avoid pulling in
 * ngx-quill and its browser-only DOM requirements into the JSDOM environment.
 */
describe('TheSeamChatComponent (logic)', () => {
  let provider: SpyAiProvider
  let messages: ChatMessage[]
  let systemPrompt: string

  /**
   * Simulates _onMessageSent logic from TheSeamChatComponent without
   * requiring Angular TestBed + Quill dependencies.
   */
  async function sendMessage(text: string) {
    const userMessage: ChatMessage = { role: 'user', content: text }
    messages.push(userMessage)

    const messagesToSend: ChatMessage[] = []
    if (systemPrompt) {
      messagesToSend.push({ role: 'system', content: systemPrompt })
    }
    messagesToSend.push(...messages)

    const response = await provider.chat(messagesToSend)
    const assistantMessage: ChatMessage = {
      role: 'assistant',
      content: response.content,
    }
    messages.push(assistantMessage)
    return {
      messages: [...messages],
      segments: parseChatResponse(response.content),
    }
  }

  beforeEach(() => {
    provider = new SpyAiProvider()
    messages = []
    systemPrompt = ''
  })

  it('should start with no messages', () => {
    expect(messages).toEqual([])
  })

  it('should add user and assistant messages on send', async () => {
    const result = await sendMessage('Hello')

    expect(result.messages.length).toBe(2)
    expect(result.messages[0].role).toBe('user')
    expect(result.messages[1].role).toBe('assistant')
  })

  it('should prepend system prompt when provided', async () => {
    systemPrompt = 'You are helpful.'

    await sendMessage('Hi')

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
    await sendMessage('Hi')

    expect(provider.lastMessages.length).toBe(1)
    expect(provider.lastMessages[0].role).toBe('user')
  })

  it('should send full history on subsequent messages', async () => {
    await sendMessage('First')
    await sendMessage('Second')

    // Should include both user + assistant messages from first exchange, plus second user message
    expect(provider.lastMessages.length).toBe(3)
    expect(provider.lastMessages[0]).toEqual({ role: 'user', content: 'First' })
    expect(provider.lastMessages[1]).toEqual({
      role: 'assistant',
      content: 'Test response',
    })
    expect(provider.lastMessages[2]).toEqual({
      role: 'user',
      content: 'Second',
    })
  })

  it('should parse response into segments', async () => {
    provider.response = 'Hello **world**'
    const result = await sendMessage('Hi')

    expect(result.segments).toEqual([
      { type: 'markdown', content: 'Hello **world**' },
    ])
  })
})

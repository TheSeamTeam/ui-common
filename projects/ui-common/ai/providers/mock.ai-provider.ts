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

import {
  ChatMessage,
  ChatResponse,
  TheSeamAiChatRequest,
  TheSeamAiProvider,
} from './ai-provider'

type MockResponse = string | ((messages: ChatMessage[]) => string)

export class MockAiProvider implements TheSeamAiProvider {
  constructor(private readonly _response: MockResponse = 'Mock response') {}

  async chat(request: TheSeamAiChatRequest): Promise<ChatResponse> {
    const content =
      typeof this._response === 'function'
        ? this._response(request.messages)
        : this._response
    return { content }
  }
}

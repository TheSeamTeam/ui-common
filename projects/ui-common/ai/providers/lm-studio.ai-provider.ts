import {
  ChatResponse,
  TheSeamAiChatRequest,
  TheSeamAiProvider,
} from './ai-provider'

export class LmStudioAiProvider implements TheSeamAiProvider {
  async chat(request: TheSeamAiChatRequest): Promise<ChatResponse> {
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
        messages: request.messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      }),
    })

    const data = await response.json()
    const content = data.choices[0].message.content
    return { content }
  }
}

import {
  ChatResponse,
  TheSeamAiChatRequest,
  TheSeamAiProvider,
} from './ai-provider'

export class OpenRouterAiProvider implements TheSeamAiProvider {
  async chat(request: TheSeamAiChatRequest): Promise<ChatResponse> {
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
        messages: request.messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        response_format: { type: 'json_object' },
      }),
    })

    const data = await response.json()
    const content = data.choices[0].message.content
    return { content }
  }
}

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
    console.log(`%cResponse from AI. content:\n${content}`, 'color: limegreen;')

    return { content }
  }
}

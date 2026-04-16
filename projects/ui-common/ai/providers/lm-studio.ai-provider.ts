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
    console.log(`%cResponse from AI. content:\n${content}`, 'color: limegreen;')

    return { content }
  }
}

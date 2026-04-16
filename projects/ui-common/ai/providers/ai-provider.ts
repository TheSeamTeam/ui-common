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

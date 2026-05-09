import { TheSeamChatContextPayload } from '../chat-context'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ChatResponse {
  content: string
}

export interface TheSeamAiChatRequest {
  messages: ChatMessage[]
  contexts?: TheSeamChatContextPayload[]
}

export interface TheSeamAiProvider {
  chat(request: TheSeamAiChatRequest): Promise<ChatResponse>
}

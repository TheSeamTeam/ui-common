// Shared providers
export { AiProvider, ChatMessage, ChatResponse } from './providers/ai-provider'
export { LmStudioAiProvider } from './providers/lm-studio.ai-provider'
export { OpenRouterAiProvider } from './providers/openrouter.ai-provider'
export { MockAiProvider } from './providers/mock.ai-provider'

// Chat
export { TheSeamChatComponent } from './chat/chat.component'
export { THESEAM_CHAT_PROVIDER } from './chat/chat-provider'
export {
  ChatBlockRegistry,
  THESEAM_CHAT_BLOCK_REGISTRY,
} from './chat/chat-block-registry'
export {
  ChatContentSegment,
  parseChatResponse,
} from './chat/chat-response-parser'
export { TheSeamChatHarness } from './chat/testing/chat.harness'

// Datatable prompter
export {
  THESEAM_DATATABLE_PROMPTER_PROVIDER,
  assistantPrompt,
  getUserPrompt,
  parseResponse,
} from './datatable-prompter/datatable-prompter-prompt-provider'
export { TheSeamDatatablePrompterComponent } from './datatable-prompter/datatable-prompter.component'

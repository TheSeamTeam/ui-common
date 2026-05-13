// Shared providers
export {
  ChatMessage,
  ChatResponse,
  ChatSession,
  ChatSessionListItem,
  ChatSessionMessage,
  ChatSessionStaleError,
  TheSeamAiChatRequest,
  TheSeamAiProvider,
} from './providers/ai-provider'
export { LmStudioAiProvider } from './providers/lm-studio.ai-provider'
export { OpenRouterAiProvider } from './providers/openrouter.ai-provider'
export {
  MockAiProvider,
  MockAiProviderConfig,
} from './providers/mock.ai-provider'

// Context registry
export { TheSeamChatContext, TheSeamChatContextPayload } from './chat-context'
export { TheSeamChatContextRegistry } from './chat-context-registry.service'
export {
  TheSeamDatatableChatContext,
  TheSeamDatatableChatContextOptions,
  TheSeamDatatableChatContextData,
} from './contexts/datatable-chat-context'

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

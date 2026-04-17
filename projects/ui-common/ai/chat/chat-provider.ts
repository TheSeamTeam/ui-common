import { InjectionToken } from '@angular/core'
import { AiProvider } from '../providers/ai-provider'

export const THESEAM_CHAT_PROVIDER = new InjectionToken<AiProvider>(
  'TheSeamChatProvider',
)

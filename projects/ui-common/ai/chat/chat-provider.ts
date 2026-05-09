import { InjectionToken } from '@angular/core'

import { TheSeamAiProvider } from '../providers/ai-provider'

export const THESEAM_CHAT_PROVIDER = new InjectionToken<TheSeamAiProvider>(
  'TheSeamChatProvider',
)

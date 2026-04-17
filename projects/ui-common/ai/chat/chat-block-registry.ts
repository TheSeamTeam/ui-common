import { InjectionToken, Type } from '@angular/core'

export type ChatBlockRegistry = Map<string, Type<unknown>>

export const THESEAM_CHAT_BLOCK_REGISTRY =
  new InjectionToken<ChatBlockRegistry>('TheSeamChatBlockRegistry')

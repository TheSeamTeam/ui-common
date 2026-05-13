import { defer, Observable, of, throwError } from 'rxjs'

import {
  ChatResponse,
  ChatSession,
  ChatSessionListItem,
  TheSeamAiChatRequest,
  TheSeamAiProvider,
} from './ai-provider'

export class LmStudioAiProvider implements TheSeamAiProvider {
  chat(request: TheSeamAiChatRequest): Observable<ChatResponse> {
    return defer(() => {
      const controller = new AbortController()
      const promise = (async () => {
        const url = 'http://localhost:1234/v1/chat/completions'
        const headers = { 'Content-Type': 'application/json' }
        const model = 'model-identifier'

        const response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            model,
            messages: request.messages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
          signal: controller.signal,
        })

        const data = await response.json()
        const content = data.choices[0].message.content
        return {
          content,
          // LM Studio is provider-only; no real session backend.
          sessionId: request.sessionId ?? 'lm-studio-local',
          label: 'LM Studio',
          leafMessageId: crypto.randomUUID(),
        } satisfies ChatResponse
      })()
      promise.finally(() => {
        /* avoid unhandled-rejection on unsubscribe */
      })
      return new Observable<ChatResponse>((subscriber) => {
        promise.then(
          (value) => {
            subscriber.next(value)
            subscriber.complete()
          },
          (err) => subscriber.error(err),
        )
        return () => controller.abort()
      })
    })
  }

  getInitialSession(): Observable<ChatSession | null> {
    return of(null)
  }

  getRecentSession(): Observable<ChatSession | null> {
    return of(null)
  }

  getSession(_uid: string): Observable<ChatSession> {
    return throwError(
      () =>
        new Error('LmStudioAiProvider does not support session persistence.'),
    )
  }

  listSessions(): Observable<ChatSessionListItem[]> {
    return of([])
  }

  renameSession(_uid: string, _label: string): Observable<void> {
    return throwError(
      () =>
        new Error('LmStudioAiProvider does not support session persistence.'),
    )
  }

  deleteSession(_uid: string): Observable<void> {
    return throwError(
      () =>
        new Error('LmStudioAiProvider does not support session persistence.'),
    )
  }
}

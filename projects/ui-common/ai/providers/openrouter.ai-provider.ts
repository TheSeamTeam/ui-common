import { defer, Observable, of, throwError } from 'rxjs'

import {
  ChatResponse,
  ChatSession,
  ChatSessionListItem,
  TheSeamAiChatRequest,
  TheSeamAiProvider,
} from './ai-provider'

export class OpenRouterAiProvider implements TheSeamAiProvider {
  chat(request: TheSeamAiChatRequest): Observable<ChatResponse> {
    return defer(() => {
      const controller = new AbortController()
      const promise = (async () => {
        const defaultApiKey =
          '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'
        const url = 'https://openrouter.ai/api/v1/chat/completions'
        const apiKey =
          localStorage.getItem('openrouter-api-key') || defaultApiKey
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
            messages: request.messages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
            response_format: { type: 'json_object' },
          }),
          signal: controller.signal,
        })

        const data = await response.json()
        const content = data.choices[0].message.content
        return {
          content,
          sessionId: request.sessionId ?? 'openrouter-remote',
          label: 'OpenRouter',
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
        new Error('OpenRouterAiProvider does not support session persistence.'),
    )
  }

  listSessions(): Observable<ChatSessionListItem[]> {
    return of([])
  }

  renameSession(_uid: string, _label: string): Observable<void> {
    return throwError(
      () =>
        new Error('OpenRouterAiProvider does not support session persistence.'),
    )
  }

  deleteSession(_uid: string): Observable<void> {
    return throwError(
      () =>
        new Error('OpenRouterAiProvider does not support session persistence.'),
    )
  }
}

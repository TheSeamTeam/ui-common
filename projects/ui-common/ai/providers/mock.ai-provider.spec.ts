import { firstValueFrom } from 'rxjs'

import { ChatSession, ChatSessionStaleError } from './ai-provider'
import { MockAiProvider } from './mock.ai-provider'

describe('MockAiProvider', () => {
  it('legacy: accepts a plain string and emits it on chat()', async () => {
    const provider = new MockAiProvider('hello')
    const response = await firstValueFrom(
      provider.chat({ messages: [{ role: 'user', content: 'hi' }] }),
    )
    expect(response.content).toBe('hello')
    expect(response.sessionId).toBeTruthy()
    expect(response.leafMessageId).toBeTruthy()
  })

  it('legacy: accepts a function and applies it to messages on chat()', async () => {
    const provider = new MockAiProvider(
      (messages) => `count:${messages.length}`,
    )
    const response = await firstValueFrom(
      provider.chat({
        messages: [
          { role: 'user', content: 'a' },
          { role: 'assistant', content: 'b' },
          { role: 'user', content: 'c' },
        ],
      }),
    )
    expect(response.content).toBe('count:3')
  })

  it('returns null from getInitialSession when not configured', async () => {
    const provider = new MockAiProvider({})
    const session = await firstValueFrom(provider.getInitialSession())
    expect(session).toBeNull()
  })

  it('returns the configured initialSession from getInitialSession', async () => {
    const session: ChatSession = {
      uid: 's1',
      label: 'Saved',
      created: '2026-05-13T00:00:00Z',
      lastActivity: '2026-05-13T00:00:00Z',
      leafMessageId: 'm1',
      messages: [
        {
          uid: 'm1',
          role: 'user',
          content: 'hi',
          created: '2026-05-13T00:00:00Z',
        },
      ],
    }
    const provider = new MockAiProvider({ initialSession: session })
    expect(await firstValueFrom(provider.getInitialSession())).toEqual(session)
  })

  it('throws ChatSessionStaleError once when throwOnFirstChat is configured', async () => {
    const err = new ChatSessionStaleError('s1', 'mX')
    const provider = new MockAiProvider({
      response: 'ok',
      throwOnFirstChat: err,
    })

    await expect(
      firstValueFrom(
        provider.chat({ messages: [{ role: 'user', content: 'a' }] }),
      ),
    ).rejects.toBe(err)

    // Second call succeeds — the one-shot was consumed.
    const r = await firstValueFrom(
      provider.chat({ messages: [{ role: 'user', content: 'a' }] }),
    )
    expect(r.content).toBe('ok')
  })

  it('honors delayMs and is cancellable mid-delay', async () => {
    const provider = new MockAiProvider({ response: 'late', delayMs: 200 })
    const obs$ = provider.chat({ messages: [{ role: 'user', content: 'a' }] })

    const sub = obs$.subscribe({
      next: () => fail('should not emit when unsubscribed mid-delay'),
    })
    sub.unsubscribe()
    // Wait long enough for the delay to have elapsed; sub already unsubscribed.
    await new Promise((resolve) => setTimeout(resolve, 300))
    // If sub did emit, the above fail() would have thrown.
  })

  it('returns getSession from sessionsByUid', async () => {
    const session: ChatSession = {
      uid: 'sX',
      label: 'X',
      created: '',
      lastActivity: '',
      leafMessageId: null,
      messages: [],
    }
    const provider = new MockAiProvider({
      sessionsByUid: new Map([['sX', session]]),
    })
    expect(await firstValueFrom(provider.getSession('sX'))).toEqual(session)
  })

  it('errors getSession when uid is not in sessionsByUid', async () => {
    const provider = new MockAiProvider({ sessionsByUid: new Map() })
    await expect(
      firstValueFrom(provider.getSession('missing')),
    ).rejects.toBeTruthy()
  })
})

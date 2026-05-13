import { firstValueFrom, Observable, of, throwError } from 'rxjs'

import {
  ChatMessage,
  ChatResponse,
  ChatSession,
  ChatSessionStaleError,
  TheSeamAiChatRequest,
  TheSeamAiProvider,
} from '../providers/ai-provider'
import { TheSeamChatContext } from '../chat-context'
import { TheSeamChatContextRegistry } from '../chat-context-registry.service'
import { parseChatResponse } from './chat-response-parser'

interface FakeProviderOptions {
  initial?: ChatSession | null
  byUid?: ReadonlyMap<string, ChatSession>
  errorOnFirstChat?: Error
}

class FakeAiProvider implements TheSeamAiProvider {
  lastRequest?: TheSeamAiChatRequest
  response = 'Test response'
  responseSessionId = 'session-new'
  responseLeaf = 'leaf-new'

  private _opts: FakeProviderOptions = {}
  private _errorOnNextChat?: Error

  constructor(opts: FakeProviderOptions = {}) {
    this._opts = opts
    this._errorOnNextChat = opts.errorOnFirstChat
  }

  chat(request: TheSeamAiChatRequest): Observable<ChatResponse> {
    this.lastRequest = request
    if (this._errorOnNextChat) {
      const err = this._errorOnNextChat
      this._errorOnNextChat = undefined
      return throwError(() => err)
    }
    return of({
      content: this.response,
      sessionId: request.sessionId ?? this.responseSessionId,
      label: 'Mock',
      leafMessageId: this.responseLeaf,
    })
  }

  getInitialSession(): Observable<ChatSession | null> {
    return of(this._opts.initial ?? null)
  }

  getRecentSession(): Observable<ChatSession | null> {
    return of(this._opts.initial ?? null)
  }

  getSession(uid: string): Observable<ChatSession> {
    const s = this._opts.byUid?.get(uid)
    return s ? of(s) : throwError(() => new Error(`no session ${uid}`))
  }

  listSessions() {
    return of([])
  }
  renameSession() {
    return of(undefined as void)
  }
  deleteSession() {
    return of(undefined as void)
  }
}

/**
 * Simulates TheSeamChatComponent's session lifecycle and send flow without
 * requiring Angular TestBed + Quill dependencies. The structure must match
 * the runtime component's behavior (see chat.component.ts).
 */
function makeSimulator(
  provider: FakeAiProvider,
  options: {
    initialSessionIdInput?: string | null
    registry?: TheSeamChatContextRegistry
    inputRef?: { restored: string | null }
  } = {},
) {
  const messages: ChatMessage[] = []
  const displayMessages: ReturnType<typeof toDisplay>[] = []
  const sessionIdEmissions: (string | null)[] = []
  const staleEmissions: number[] = []
  let currentSessionId: string | null = null
  let currentLeafMessageId: string | null = null

  function toDisplay(m: ChatMessage, ts: Date) {
    return {
      role: m.role,
      segments:
        m.role === 'assistant'
          ? parseChatResponse(m.content)
          : [{ type: 'markdown' as const, content: m.content }],
      timestamp: ts,
    }
  }

  function applySession(session: ChatSession) {
    const wasNoSession = currentSessionId === null
    currentSessionId = session.uid
    currentLeafMessageId = session.leafMessageId
    messages.length = 0
    displayMessages.length = 0
    for (const m of session.messages) {
      messages.push({ role: m.role, content: m.content })
      displayMessages.push(
        toDisplay({ role: m.role, content: m.content }, new Date(m.created)),
      )
    }
    if (wasNoSession) sessionIdEmissions.push(session.uid)
  }

  async function init(initial: string | null | undefined) {
    if (initial) {
      const s = await firstValueFrom(provider.getSession(initial))
      applySession(s)
    } else {
      const s = await firstValueFrom(provider.getInitialSession())
      if (s) applySession(s)
    }
  }

  async function setSessionIdInput(next: string | null) {
    if (next === currentSessionId) return
    if (next === null) {
      currentSessionId = null
      currentLeafMessageId = null
      messages.length = 0
      displayMessages.length = 0
      sessionIdEmissions.push(null)
      return
    }
    const s = await firstValueFrom(provider.getSession(next))
    applySession(s)
  }

  function newSession() {
    currentSessionId = null
    currentLeafMessageId = null
    messages.length = 0
    displayMessages.length = 0
    sessionIdEmissions.push(null)
  }

  async function send(text: string) {
    messages.push({ role: 'user', content: text })
    displayMessages.push(toDisplay({ role: 'user', content: text }, new Date()))

    try {
      const response = await firstValueFrom(
        provider.chat({
          messages: [...messages],
          contexts: (await options.registry?.snapshot()) ?? undefined,
          sessionId: currentSessionId,
          expectedLeafMessageId: currentLeafMessageId,
        }),
      )
      messages.push({ role: 'assistant', content: response.content })
      displayMessages.push(
        toDisplay({ role: 'assistant', content: response.content }, new Date()),
      )
      const wasNoSession = currentSessionId === null
      currentSessionId = response.sessionId
      currentLeafMessageId = response.leafMessageId
      if (wasNoSession) sessionIdEmissions.push(response.sessionId)
    } catch (err) {
      if (err instanceof ChatSessionStaleError) {
        const sessionId = currentSessionId
        if (sessionId) {
          try {
            const reloaded = await firstValueFrom(
              provider.getSession(sessionId),
            )
            applySession(reloaded)
          } catch {
            /* reload failure: still restore + emit */
          }
        }
        if (options.inputRef) options.inputRef.restored = text
        staleEmissions.push(staleEmissions.length + 1)
      } else {
        throw err
      }
    }
  }

  return {
    messages,
    displayMessages,
    sessionIdEmissions,
    staleEmissions,
    getCurrentSessionId: () => currentSessionId,
    getCurrentLeafMessageId: () => currentLeafMessageId,
    init,
    setSessionIdInput,
    newSession,
    send,
  }
}

describe('TheSeamChatComponent (logic)', () => {
  it('starts empty when provider.getInitialSession returns null', async () => {
    const provider = new FakeAiProvider({ initial: null })
    const sim = makeSimulator(provider)
    await sim.init(null)
    expect(sim.messages).toEqual([])
    expect(sim.getCurrentSessionId()).toBeNull()
    expect(sim.sessionIdEmissions).toEqual([])
  })

  it('populates from getInitialSession and emits sessionIdChange on first load', async () => {
    const session: ChatSession = {
      uid: 's1',
      label: 'l',
      created: '2026-05-13T00:00:00Z',
      lastActivity: '2026-05-13T00:00:00Z',
      leafMessageId: 'm2',
      messages: [
        {
          uid: 'm1',
          role: 'user',
          content: 'hi',
          created: '2026-05-13T00:00:00Z',
        },
        {
          uid: 'm2',
          role: 'assistant',
          content: 'hello',
          created: '2026-05-13T00:00:01Z',
        },
      ],
    }
    const provider = new FakeAiProvider({ initial: session })
    const sim = makeSimulator(provider)
    await sim.init(null)
    expect(sim.messages).toHaveLength(2)
    expect(sim.getCurrentSessionId()).toBe('s1')
    expect(sim.getCurrentLeafMessageId()).toBe('m2')
    expect(sim.sessionIdEmissions).toEqual(['s1'])
  })

  it('loads a specific session when sessionId input is a uid', async () => {
    const session: ChatSession = {
      uid: 'sX',
      label: 'X',
      created: '',
      lastActivity: '',
      leafMessageId: 'm1',
      messages: [
        {
          uid: 'm1',
          role: 'user',
          content: 'q',
          created: '2026-05-13T00:00:00Z',
        },
      ],
    }
    const provider = new FakeAiProvider({ byUid: new Map([['sX', session]]) })
    const sim = makeSimulator(provider)
    await sim.init('sX')
    expect(sim.getCurrentSessionId()).toBe('sX')
    expect(sim.messages).toHaveLength(1)
  })

  it('send round-trips sessionId and expectedLeafMessageId', async () => {
    const provider = new FakeAiProvider()
    const sim = makeSimulator(provider)
    await sim.init(null)
    // simulate prior session
    await sim.send('first')
    const sid = sim.getCurrentSessionId()
    const lid = sim.getCurrentLeafMessageId()
    expect(sid).toBeTruthy()
    expect(lid).toBeTruthy()

    provider.responseLeaf = 'leaf-2'
    await sim.send('second')

    expect(provider.lastRequest!.sessionId).toBe(sid)
    expect(provider.lastRequest!.expectedLeafMessageId).toBe(lid)
    expect(sim.getCurrentLeafMessageId()).toBe('leaf-2')
  })

  it('emits sessionIdChange exactly once when first send creates the session', async () => {
    const provider = new FakeAiProvider()
    const sim = makeSimulator(provider)
    await sim.init(null)
    expect(sim.sessionIdEmissions).toEqual([])
    await sim.send('hi')
    expect(sim.sessionIdEmissions).toHaveLength(1)
    await sim.send('again')
    expect(sim.sessionIdEmissions).toHaveLength(1)
  })

  it('handles stale-leaf by reloading, restoring text, and emitting staleSession', async () => {
    const reloaded: ChatSession = {
      uid: 's1',
      label: 'l',
      created: '',
      lastActivity: '',
      leafMessageId: 'm3',
      messages: [
        {
          uid: 'm1',
          role: 'user',
          content: 'a',
          created: '2026-05-13T00:00:00Z',
        },
        {
          uid: 'm2',
          role: 'assistant',
          content: 'b',
          created: '2026-05-13T00:00:01Z',
        },
        {
          uid: 'm3',
          role: 'user',
          content: 'c',
          created: '2026-05-13T00:00:02Z',
        },
      ],
    }
    const provider = new FakeAiProvider({
      initial: {
        uid: 's1',
        label: '',
        created: '',
        lastActivity: '',
        leafMessageId: 'm-old',
        messages: [],
      },
      byUid: new Map([['s1', reloaded]]),
      errorOnFirstChat: new ChatSessionStaleError('s1', 'm3'),
    })
    const inputRef = { restored: null as string | null }
    const sim = makeSimulator(provider, { inputRef })
    await sim.init(null)

    await sim.send('typed text')

    expect(inputRef.restored).toBe('typed text')
    expect(sim.staleEmissions).toHaveLength(1)
    expect(sim.messages).toHaveLength(reloaded.messages.length)
    expect(sim.getCurrentLeafMessageId()).toBe('m3')
  })

  it('setSessionIdInput to null after init resets the chat', async () => {
    const session: ChatSession = {
      uid: 's1',
      label: '',
      created: '',
      lastActivity: '',
      leafMessageId: 'm1',
      messages: [
        {
          uid: 'm1',
          role: 'user',
          content: 'q',
          created: '2026-05-13T00:00:00Z',
        },
      ],
    }
    const provider = new FakeAiProvider({ initial: session })
    const sim = makeSimulator(provider)
    await sim.init(null)
    expect(sim.messages).toHaveLength(1)

    await sim.setSessionIdInput(null)
    expect(sim.messages).toEqual([])
    expect(sim.getCurrentSessionId()).toBeNull()
    expect(sim.sessionIdEmissions[sim.sessionIdEmissions.length - 1]).toBeNull()
  })

  it('setSessionIdInput to a uid after init loads that session', async () => {
    const a: ChatSession = {
      uid: 'A',
      label: '',
      created: '',
      lastActivity: '',
      leafMessageId: 'a1',
      messages: [
        {
          uid: 'a1',
          role: 'user',
          content: 'A',
          created: '2026-05-13T00:00:00Z',
        },
      ],
    }
    const b: ChatSession = {
      uid: 'B',
      label: '',
      created: '',
      lastActivity: '',
      leafMessageId: 'b1',
      messages: [
        {
          uid: 'b1',
          role: 'user',
          content: 'B',
          created: '2026-05-13T00:00:00Z',
        },
      ],
    }
    const provider = new FakeAiProvider({
      initial: a,
      byUid: new Map([
        ['A', a],
        ['B', b],
      ]),
    })
    const sim = makeSimulator(provider)
    await sim.init(null)
    expect(sim.getCurrentSessionId()).toBe('A')

    await sim.setSessionIdInput('B')
    expect(sim.getCurrentSessionId()).toBe('B')
    expect(sim.messages[0].content).toBe('B')
  })

  it('newSession clears state and emits sessionIdChange(null)', async () => {
    const provider = new FakeAiProvider()
    const sim = makeSimulator(provider)
    await sim.init(null)
    await sim.send('a')
    expect(sim.getCurrentSessionId()).toBeTruthy()

    sim.newSession()
    expect(sim.messages).toEqual([])
    expect(sim.getCurrentSessionId()).toBeNull()
    expect(sim.sessionIdEmissions[sim.sessionIdEmissions.length - 1]).toBeNull()
  })

  it('forwards contexts when registry has entries', async () => {
    const registry = new TheSeamChatContextRegistry()
    const ctx: TheSeamChatContext = {
      type: 'datatable',
      getContext: () => ({ label: 'Bales' }),
    }
    registry.register(ctx)
    const provider = new FakeAiProvider()
    const sim = makeSimulator(provider, { registry })
    await sim.init(null)
    await sim.send('how many?')

    expect(provider.lastRequest!.contexts).toEqual([
      { type: 'datatable', data: { label: 'Bales' } },
    ])
  })

  it('omits the contexts field when no registry is provided', async () => {
    const provider = new FakeAiProvider()
    const sim = makeSimulator(provider)
    await sim.init(null)
    await sim.send('hi')
    expect(provider.lastRequest!.contexts).toBeUndefined()
  })

  it('parses assistant response into segments on send', async () => {
    const provider = new FakeAiProvider()
    provider.response = 'Hello **world**'
    const sim = makeSimulator(provider)
    await sim.init(null)
    await sim.send('hi')
    expect(sim.displayMessages.at(-1)!.segments).toEqual([
      { type: 'markdown', content: 'Hello **world**' },
    ])
  })
})

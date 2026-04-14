// jsdom does not implement the WHATWG fetch/Response/Request/Headers globals,
// and Jest's vm sandbox does not expose Node 22's built-in fetch either.
// Provide minimal stubs so tests can spy on fetch and construct Response objects.

if (typeof (globalThis as any).fetch === 'undefined') {
  // Stub — tests replace this with a jest.spyOn mock before calling the SUT.
  ;(globalThis as any).fetch = () =>
    Promise.reject(new Error('fetch not mocked'))
}

if (typeof (globalThis as any).Response === 'undefined') {
  // Minimal Response stub compatible with the WHATWG fetch spec surface used in tests.
  ;(globalThis as any).Response = class Response {
    readonly ok: boolean
    readonly status: number
    readonly statusText: string
    private readonly _body: string

    constructor(body?: BodyInit | null, init?: ResponseInit) {
      const status = init?.status ?? 200
      this.status = status
      this.statusText = init?.statusText ?? ''
      this.ok = status >= 200 && status < 300
      this._body = typeof body === 'string' ? body : ''
    }

    async json() {
      return JSON.parse(this._body)
    }

    async text() {
      return this._body
    }
  }
}

Object.defineProperty(window, 'CSS', { value: null })
Object.defineProperty(document, 'doctype', {
  value: '<!DOCTYPE html>',
})
Object.defineProperty(window, 'getComputedStyle', {
  value: () => {
    return {
      display: 'none',
      appearance: ['-webkit-appearance'],
      getPropertyValue: () => {
        return ''
      },
    }
  },
})
/**
 * ISSUE: https://github.com/angular/material2/issues/7101
 * Workaround for JSDOM missing transform property
 */
Object.defineProperty(document.body.style, 'transform', {
  value: () => {
    return {
      enumerable: true,
      configurable: true,
    }
  },
})

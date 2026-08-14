import {
  TheSeamGuideAdapter,
  TheSeamGuideAdapterCallbacks,
  TheSeamGuideAdapterConfig,
} from '../adapter/guide-adapter'

/**
 * Engine-free adapter for specs. Records what the service asked for and lets a
 * test simulate user intent without a DOM.
 */
export class FakeGuideAdapter implements TheSeamGuideAdapter {
  readonly calls: string[] = []

  startedConfig: TheSeamGuideAdapterConfig | null = null

  private _callbacks: TheSeamGuideAdapterCallbacks | null = null
  private _active = false

  start(
    config: TheSeamGuideAdapterConfig,
    callbacks: TheSeamGuideAdapterCallbacks,
  ): void {
    this.startedConfig = config
    this._callbacks = callbacks
    this._active = true
    this.calls.push('start')
  }

  next(): void {
    this.calls.push('next')
  }

  previous(): void {
    this.calls.push('previous')
  }

  moveTo(index: number): void {
    this.calls.push(`moveTo:${index}`)
  }

  refresh(): void {
    this.calls.push('refresh')
  }

  destroy(): void {
    this._active = false
    this.calls.push('destroy')
  }

  isActive(): boolean {
    return this._active
  }

  /** Resolves the element for a step, as the engine would at paint time. */
  resolveStepElement(index: number): Element | undefined {
    return this.startedConfig?.steps[index]?.element?.()
  }

  emitNext(): void {
    this._callbacks?.onNextRequested()
  }

  emitPrevious(): void {
    this._callbacks?.onPreviousRequested()
  }

  emitClose(): void {
    this._callbacks?.onCloseRequested()
  }
}

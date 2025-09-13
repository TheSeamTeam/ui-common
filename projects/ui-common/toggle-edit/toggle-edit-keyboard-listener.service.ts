import { DOCUMENT } from '@angular/common'
import { inject, Injectable } from '@angular/core'

import { TheSeamCanToggleEdit } from './models'

@Injectable({ providedIn: 'root' })
export class TheSeamToggleEditKeyboardListenerService {

  private readonly _document: Document = inject(DOCUMENT)

  private _elements: TheSeamCanToggleEdit[] = []

  private _isListening = false

  public add(element: TheSeamCanToggleEdit): void {
    this._elements.push(element)
    this._startListening()
  }

  public remove(element: TheSeamCanToggleEdit): void {
    this._elements = this._elements.filter(v => v !== element)
    if (this._elements.length === 0) {
      this._stopListening()
    }
  }

  public isListening(): boolean {
    return this._isListening
  }

  private _startListening(): void {
    if (this.isListening()) {
      return
    }

    this._document.body.addEventListener('keydown', this._keydownListener, true)

    this._isListening = true
  }

  private _stopListening(): void {
    if (!this.isListening()) {
      return
    }

    this._document.body.removeEventListener('keydown', this._keydownListener, true)

    this._isListening = false
  }

  private _keydownListener = (event: KeyboardEvent): boolean | void => {
    for (const element of this._elements) {
      if (element.isEditing()) {
        element.keydownEvent(event)
      }
    }
  }

}

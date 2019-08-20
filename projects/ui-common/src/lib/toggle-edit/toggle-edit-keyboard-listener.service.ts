import { DOCUMENT } from '@angular/common'
import { Inject, Injectable } from '@angular/core'

import { ICanToggleEdit } from './models'

@Injectable({
  providedIn: 'root'
})
export class ToggleEditKeyboardListenerService {

  private _elements: ICanToggleEdit[] = []

  private _isListening = false

  private _document: Document

  constructor(
    @Inject(DOCUMENT) private document: any
  ) {
    this._document = document
  }

  public add(element: ICanToggleEdit): void {
    this._elements.push(element)
    this._startListening()
  }

  public remove(element: ICanToggleEdit): void {
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

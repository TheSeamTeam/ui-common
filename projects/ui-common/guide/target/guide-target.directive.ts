import {
  Directive,
  ElementRef,
  effect,
  inject,
  input,
  OnDestroy,
} from '@angular/core'

import { TheSeamGuideTargetRegistry } from './guide-target-registry'

/**
 * Marks an element as a named guide target.
 *
 * Registering on init and unregistering on destroy is what lets a guide await a
 * target that has not rendered yet, and recover when one is destroyed and
 * recreated mid-step.
 */
@Directive({
  selector: '[seamGuideTarget]',
  standalone: true,
})
export class TheSeamGuideTargetDirective implements OnDestroy {
  private readonly _registry = inject(TheSeamGuideTargetRegistry)
  private readonly _elementRef = inject<ElementRef<Element>>(ElementRef)

  readonly seamGuideTarget = input.required<string>()

  private _registeredName: string | null = null

  constructor() {
    effect(() => {
      const name = this.seamGuideTarget()
      if (this._registeredName === name) {
        return
      }
      const element = this._elementRef.nativeElement
      if (this._registeredName !== null) {
        this._registry.unregister(this._registeredName, element)
      }
      this._registry.register(name, element)
      this._registeredName = name
    })
  }

  ngOnDestroy(): void {
    if (this._registeredName !== null) {
      this._registry.unregister(
        this._registeredName,
        this._elementRef.nativeElement,
      )
      this._registeredName = null
    }
  }
}

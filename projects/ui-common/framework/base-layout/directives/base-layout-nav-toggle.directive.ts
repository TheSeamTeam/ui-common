import { ChangeDetectorRef, Directive, HostBinding, HostListener, inject, Inject, Input, OnInit, Optional } from '@angular/core'
import { tap } from 'rxjs/operators'

import { TheSeamBaseLayoutRef } from '../base-layout-ref'
import { THESEAM_BASE_LAYOUT_REF } from '../base-layout-tokens'

/**
 * Can be used to toggle the expand state of the registered nav.
 */
@Directive({
  selector: 'button[seamBaseLayoutNavToggle]',
  exportAs: 'seamBaseLayoutNavToggle',
})
export class TheSeamBaseLayoutNavToggleDirective implements OnInit {

  private readonly _cdr = inject(ChangeDetectorRef)
  private readonly _baseLayout: TheSeamBaseLayoutRef | null = inject(THESEAM_BASE_LAYOUT_REF, { optional: true })

  public baseLayout: TheSeamBaseLayoutRef | undefined = this._baseLayout ?? undefined

  @HostBinding('attr.type')
  get _attrType() { return this.type }

  @Input() type: string | undefined | null = 'button'

  @HostBinding('attr.aria-label')
  get _attrAriaLabel() { return this.ariaLabel || null }

  /** Screenreader label for the button. */
  @Input('aria-label') ariaLabel: string | undefined | null = 'Navigation toggle'

  @HostBinding('class.base-layout-nav-toggle') _toggleClass = true
  @HostBinding('class.base-layout-nav-toggle--expanded') _expandedClass = false

  @HostListener('click')
  _onClick() {
    if (this.baseLayout && this.baseLayout.registeredNav) {
      this.baseLayout.registeredNav.toggle()
    }
  }

  ngOnInit() {
    this.baseLayout?.registeredNav?.expanded$.pipe(
      tap(exp => {
        this._expandedClass = exp
        this._cdr.markForCheck()
      }),
    ).subscribe()
  }
}

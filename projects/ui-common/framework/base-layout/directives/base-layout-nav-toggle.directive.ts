import { ChangeDetectorRef, Directive, HostBinding, HostListener, Inject, Input, OnInit, Optional } from '@angular/core'
import { tap } from 'rxjs/operators'

import type { ITheSeamBaseLayoutRef } from '../base-layout-ref'
import { THESEAM_BASE_LAYOUT_REF } from '../base-layout-tokens'

/**
 * Can be used to toggle the expand state of the registered nav.
 */
@Directive({
  selector: 'button[seamBaseLayoutNavToggle]',
  exportAs: 'seamBaseLayoutNavToggle'
})
export class BaseLayoutNavToggleDirective implements OnInit {

  public baseLayout: ITheSeamBaseLayoutRef | undefined

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

  constructor(
    private readonly _cdr: ChangeDetectorRef,
    @Optional() @Inject(THESEAM_BASE_LAYOUT_REF) _baseLayout: ITheSeamBaseLayoutRef
  ) {
    this.baseLayout = _baseLayout
  }

  ngOnInit() {
    this.baseLayout?.registeredNav?.expanded$.pipe(
      tap(exp => {
        this._expandedClass = exp
        this._cdr.markForCheck()
      })
    ).subscribe()
  }
}

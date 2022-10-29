import { BooleanInput } from '@angular/cdk/coercion'
import { ESCAPE } from '@angular/cdk/keycodes'
import { Overlay, OverlayRef } from '@angular/cdk/overlay'
import { ComponentPortal, TemplatePortal } from '@angular/cdk/portal'
import {
  AfterViewInit, Component, ContentChild, EventEmitter, forwardRef, Input,
  isDevMode, OnDestroy, OnInit, Output, TemplateRef, ViewChild, ViewContainerRef
} from '@angular/core'
import { UntypedFormGroup } from '@angular/forms'
import { ActivatedRoute } from '@angular/router'
import { filter } from 'rxjs/operators'

import { IconProp } from '@fortawesome/fontawesome-svg-core'

import { InputBoolean } from '@theseam/ui-common/core'
import { SeamIcon } from '@theseam/ui-common/icon'

import { ModalFooterTplDirective } from '../directives/modal-footer-tpl.directive'
import { ModalHeaderIconTplDirective } from '../directives/modal-header-icon-tpl.directive'
import { ModalHeaderTitleTplDirective } from '../directives/modal-header-title-tpl.directive'
import { IModalContainer, THESEAM_MODAL_CONTAINER } from '../modal.models'

export const LIB_MODAL: any = {
  provide: THESEAM_MODAL_CONTAINER,
  // tslint:disable-next-line:no-use-before-declare
  useExisting: forwardRef(() => ModalComponent),
  multi: true,
}

@Component({
  selector: 'seam-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
  providers: [ LIB_MODAL ]
})
export class ModalComponent implements OnInit, OnDestroy, AfterViewInit, IModalContainer {
  static ngAcceptInputType_showCloseBtn: BooleanInput

  @Input()
  set closeOnKeyPressed(value: number[]) { this._closeOnKeyPressed = Array.isArray(value) ? value : [] }
  get closeOnKeyPressed(): number[] { return this._closeOnKeyPressed }
  private _closeOnKeyPressed: number[] = [ ESCAPE ]

  @Input() @InputBoolean() showCloseBtn: boolean = true

  @Input() titleText: string | undefined | null

  @Input()
  get icon(): SeamIcon | undefined { return this._iconUrl || this._iconObj }
  set icon(value: SeamIcon | undefined) {
    if (typeof value === 'string') {
      this._iconUrl = value
      this._iconObj = undefined
    } else {
      this._iconUrl = undefined
      this._iconObj = value
    }
  }

  public _iconUrl: string | undefined
  public _iconObj: IconProp | undefined

  @Input()
  get iconTpl(): TemplateRef<HTMLElement> | undefined {
    return this._iconTpl || (this._queryIconTpl && this._queryIconTpl.template)
  }
  set iconTpl(value: TemplateRef<HTMLElement> | undefined) {
    this._iconTpl = value
  }
  private _iconTpl?: TemplateRef<HTMLElement>

  @Input()
  get titleTpl(): TemplateRef<HTMLElement> | undefined {
    return this._titleTpl || (this._queryTitleTpl && this._queryTitleTpl.template)
  }
  set titleTpl(value: TemplateRef<HTMLElement> | undefined) {
    this._titleTpl = value
  }
  private _titleTpl?: TemplateRef<HTMLElement>

  @Input()
  get footerTpl(): TemplateRef<HTMLElement> | undefined {
    return this._footerTpl || (this._queryFooterTpl && this._queryFooterTpl.template)
  }
  set footerTpl(value: TemplateRef<HTMLElement> | undefined) {
    this._footerTpl = value
  }
  private _footerTpl?: TemplateRef<HTMLElement>

  @Output() modalClosed = new EventEmitter<void>()

  _overlayRef?: OverlayRef

  @Output() overlayDetached = new EventEmitter<void>()

  @ContentChild(ModalHeaderIconTplDirective, { static: true })  _queryIconTpl?: ModalHeaderIconTplDirective
  @ContentChild(ModalHeaderTitleTplDirective, { static: true })  _queryTitleTpl?: ModalHeaderTitleTplDirective
  @ContentChild(ModalFooterTplDirective, { static: true })  _queryFooterTpl?: ModalFooterTplDirective

  @ViewChild('modalTpl', { static: true }) _modalTpl?: TemplateRef<HTMLElement>

  /** Makes the modal container a form with this formGroup. */
  @Input() form: UntypedFormGroup | undefined | null

  /** Emit the `(ngSubmit)` event. NOTE: Only if `form` is defined. */
  @Output() formSubmit = new EventEmitter<void>()

  constructor(
    private _viewContainerRef: ViewContainerRef,
    private _overlay: Overlay,
    private _route: ActivatedRoute
  ) {
    if (isDevMode()) {
      // tslint:disable-next-line:max-line-length
      console.warn('seamModal has some issues with its design. Use the Modal service for now, because seamModal will have breaking changes or be removed soon.')
    }
  }

  ngOnInit() { }

  ngOnDestroy() {
    this.close()
  }

  ngAfterViewInit() {
    if (this.isRouteModal()) {
      this.open()
    }
  }

  public open(portal?: TemplatePortal | ComponentPortal<{}>) {
    if (this._overlayRef && this._overlayRef.hasAttached()) { return }

    const positionStrategy = this._overlay.position()
      .global()
      .centerHorizontally()
      .centerVertically()

    this._overlayRef = this._overlay.create({
      hasBackdrop: true,
      positionStrategy: positionStrategy
    })

    this._overlayRef.detachments().subscribe(_ => this.overlayDetached.emit())

    this._overlayRef.backdropClick().subscribe(_ => this.close())

    this._overlayRef.keydownEvents()
      // tslint:disable-next-line:deprecation
      .pipe(filter(e => e.keyCode === ESCAPE))
      .subscribe(_ => this.close())

    let portalToAttach = portal
    if (!portalToAttach) {
      if (!this._modalTpl) {
        throw new Error(`_modalTpl not found.`)
      }
      portalToAttach = new TemplatePortal(this._modalTpl, this._viewContainerRef)
    }

    this._overlayRef.attach(portalToAttach)
  }

  public close() {
    if (!this._overlayRef || !this._overlayRef.hasAttached()) { return }

    this._overlayRef.detach()

    this.modalClosed.emit()
  }

  _onSubmit() {
    this.formSubmit.emit()
  }

  public isRouteModal() {
    return this._route.outlet === 'modal'
  }

}

import { ESCAPE } from '@angular/cdk/keycodes'
import { Overlay, OverlayRef } from '@angular/cdk/overlay'
import { ComponentPortal, TemplatePortal } from '@angular/cdk/portal'
import {
  AfterViewInit, Component, ContentChild, EventEmitter, forwardRef, Input,
  isDevMode, OnDestroy, OnInit, Output, TemplateRef, ViewChild, ViewContainerRef
} from '@angular/core'
import { FormGroup } from '@angular/forms'
import { ActivatedRoute } from '@angular/router'
import { filter } from 'rxjs/operators'

import { IconProp } from '@fortawesome/fontawesome-svg-core'

import { SeamIcon } from '../../icon/index'

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

  @Input() closeOnKeyPressed = [ ESCAPE ]

  @Input() showCloseBtn = true

  @Input() titleText: string

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
  get iconTpl(): TemplateRef<HTMLElement> {
    return this._iconTpl || (this._queryIconTpl && this._queryIconTpl.template)
  }
  set iconTpl(value: TemplateRef<HTMLElement>) {
    this._iconTpl = value
  }
  private _iconTpl: TemplateRef<HTMLElement>

  @Input()
  get titleTpl(): TemplateRef<HTMLElement> {
    return this._titleTpl || (this._queryTitleTpl && this._queryTitleTpl.template)
  }
  set titleTpl(value: TemplateRef<HTMLElement>) {
    this._titleTpl = value
  }
  private _titleTpl: TemplateRef<HTMLElement>

  @Input()
  get footerTpl(): TemplateRef<HTMLElement> {
    return this._footerTpl || (this._queryFooterTpl && this._queryFooterTpl.template)
  }
  set footerTpl(value: TemplateRef<HTMLElement>) {
    this._footerTpl = value
  }
  private _footerTpl: TemplateRef<HTMLElement>

  @Output() modalClosed = new EventEmitter<void>()

  _overlayRef: OverlayRef

  @Output() overlayDetached = new EventEmitter<void>()

  @ContentChild(ModalHeaderIconTplDirective, { static: true })  _queryIconTpl: ModalHeaderIconTplDirective
  @ContentChild(ModalHeaderTitleTplDirective, { static: true })  _queryTitleTpl: ModalHeaderTitleTplDirective
  @ContentChild(ModalFooterTplDirective, { static: true })  _queryFooterTpl: ModalFooterTplDirective

  @ViewChild('modalTpl', { static: true }) _modalTpl: TemplateRef<HTMLElement>

  /** Makes the modal container a form with this formGroup. */
  @Input() form: FormGroup

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

    this._overlayRef.attach(portal || new TemplatePortal(this._modalTpl, this._viewContainerRef))
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

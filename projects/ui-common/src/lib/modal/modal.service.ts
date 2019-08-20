import { Directionality } from '@angular/cdk/bidi'
import {
  ComponentType,
  Overlay,
  OverlayConfig,
  OverlayRef,
  ScrollStrategy,
} from '@angular/cdk/overlay'
import { ComponentPortal, PortalInjector, TemplatePortal } from '@angular/cdk/portal'
import { Location } from '@angular/common'
import {
  ComponentRef,
  Inject,
  Injectable,
  Injector,
  OnDestroy,
  Optional,
  SkipSelf,
  TemplateRef,
  Type
} from '@angular/core'
import { defer, Observable, of as observableOf, Subject } from 'rxjs'
import { startWith } from 'rxjs/operators'

import { OverlayScrollbarsService } from '../scrollbar'

import { ModalConfig } from './modal-config'
import { ModalContainerComponent } from './modal-container/modal-container.component'
import {
  MODAL_CONFIG,
  MODAL_CONTAINER,
  MODAL_DATA,
  MODAL_REF,
  MODAL_SCROLL_STRATEGY,
} from './modal-injectors'
import { ModalRef } from './modal-ref'


/**
 * Service to open modal dialogs.
 */
@Injectable()
export class Modal implements OnDestroy {
  private _scrollStrategy: () => ScrollStrategy

  /** Stream that emits when all dialogs are closed. */
  get _afterAllClosed(): Observable<void> {
    return this._parentDialog ? this._parentDialog.afterAllClosed : this._afterAllClosedBase
  }
  _afterAllClosedBase = new Subject<void>()

  afterAllClosed: Observable<void> = defer(() => this.openDialogs.length ?
      this._afterAllClosed : this._afterAllClosed.pipe(startWith(undefined)))

  /** Stream that emits when a dialog is opened. */
  get afterOpened(): Subject<ModalRef<any>> {
    return this._parentDialog ? this._parentDialog.afterOpened : this._afterOpened
  }
  _afterOpened: Subject<ModalRef<any>> = new Subject()

  /** Stream that emits when a dialog is opened. */
  get openDialogs(): ModalRef<any>[] {
    return this._parentDialog ? this._parentDialog.openDialogs : this._openDialogs
  }
  _openDialogs: ModalRef<any>[] = []

  constructor(
    private overlay: Overlay,
    private injector: Injector,
    @Inject(MODAL_REF) private dialogRefConstructor: Type<ModalRef<any>>,
    @Inject(MODAL_SCROLL_STRATEGY) scrollStrategy: any,
    @Optional() @SkipSelf() private _parentDialog: Modal,
    @Optional() location: Location,
    private _scrollbars: OverlayScrollbarsService
  ) {

    // Close all of the dialogs when the user goes forwards/backwards in history or when the
    // location hash changes. Note that this usually doesn't include clicking on links (unless
    // the user is using the `HashLocationStrategy`).
    if (!_parentDialog && location) {
      location.subscribe(() => this.closeAll())
    }

    this._scrollStrategy = scrollStrategy
  }

  /** Gets an open dialog by id. */
  getById(id: string): ModalRef<any> | undefined {
    return this._openDialogs.find(ref  => ref.id === id)
  }

  /** Closes all open dialogs. */
  closeAll(): void {
    this.openDialogs.forEach(ref => ref.close())
  }

  /** Opens a dialog from a component. */
  openFromComponent<T, D = any>(component: ComponentType<T>, config?: ModalConfig<D>): ModalRef<T, D> {
    config = this._applyConfigDefaults(config)

    if (config.id && this.getById(config.id)) {
      throw Error(`Modal with id "${config.id}" exists already. The modal id must be unique.`)
    }

    const overlayRef = this._createOverlay(config)
    const dialogContainer = this._attachDialogContainer(overlayRef, config)
    const dialogRef = this._attachDialogContentForComponent(component, dialogContainer,
      overlayRef, config)

    this._scrollbars.initializeInstance(overlayRef.overlayElement)

    this.registerDialogRef(dialogRef)
    return dialogRef
  }

  /** Opens a dialog from a template. */
  openFromTemplate<T>(template: TemplateRef<T>, config?: ModalConfig): ModalRef<any> {
    config = this._applyConfigDefaults(config)

    if (config.id && this.getById(config.id)) {
      throw Error(`Modal with id "${config.id}" exists already. The modal id must be unique.`)
    }

    const overlayRef = this._createOverlay(config)
    const dialogContainer = this._attachDialogContainer(overlayRef, config)
    const dialogRef = this._attachDialogContentForTemplate(template, dialogContainer,
      overlayRef, config)

    this._scrollbars.destroyInstance(overlayRef.overlayElement)

    this.registerDialogRef(dialogRef)
    return dialogRef
  }

  ngOnDestroy() {
    // Only close all the dialogs at this level.
    this._openDialogs.forEach(ref => ref.close())
  }

  /**
   * Forwards emitting events for when dialogs are opened and all dialogs are closed.
   */
  private registerDialogRef(dialogRef: ModalRef<any>): void {
    this.openDialogs.push(dialogRef)

    const dialogOpenSub = dialogRef.afterOpened().subscribe(() => {
      this.afterOpened.next(dialogRef)
      dialogOpenSub.unsubscribe()
    })

    const dialogCloseSub = dialogRef.afterClosed().subscribe(() => {
      const dialogIndex = this._openDialogs.indexOf(dialogRef)

      if (dialogIndex > -1) {
        this._openDialogs.splice(dialogIndex, 1)
      }

      if (!this._openDialogs.length) {
        this._afterAllClosedBase.next()
        dialogCloseSub.unsubscribe()
      }
    })
  }

  /**
   * Creates an overlay config from a dialog config.
   * @param config The dialog configuration.
   * @returns The overlay configuration.
   */
  protected _createOverlay(config: ModalConfig): OverlayRef {
    let panelClass = (config.panelClass || [])
    if (typeof panelClass === 'string') {
      panelClass = [ panelClass ]
    }
    panelClass = [ ...panelClass, 'modal',  'd-block', 'overflow-auto' ]

    const overlayConfig = new OverlayConfig({
      positionStrategy: this.overlay.position().global(),
      scrollStrategy: this._scrollStrategy(),
      panelClass: panelClass,
      hasBackdrop: config.hasBackdrop,
      direction: config.direction,
      minWidth: config.minWidth,
      minHeight: config.minHeight,
      maxWidth: config.maxWidth,
      maxHeight: config.maxHeight
    })

    if (config.backdropClass) {
      overlayConfig.backdropClass = config.backdropClass
    }
    return this.overlay.create(overlayConfig)
  }

  /**
   * Attaches an MatDialogContainer to a dialog's already-created overlay.
   * @param overlay Reference to the dialog's underlying overlay.
   * @param config The dialog configuration.
   * @returns A promise resolving to a ComponentRef for the attached container.
   */
  protected _attachDialogContainer(overlay: OverlayRef, config: ModalConfig): ModalContainerComponent {
    const container = config.containerComponent || this.injector.get(MODAL_CONTAINER)
    const userInjector = config && config.viewContainerRef && config.viewContainerRef.injector
    const injector = new PortalInjector(userInjector || this.injector, new WeakMap([
      [ModalConfig, config]
    ]))
    const containerPortal = new ComponentPortal(container, config.viewContainerRef, injector)
    const containerRef = <ComponentRef<ModalContainerComponent>>overlay.attach(containerPortal)
    containerRef.instance._config = config

    return containerRef.instance
  }


  /**
   * Attaches the user-provided component to the already-created MatDialogContainer.
   * @param componentOrTemplateRef The type of component being loaded into the dialog,
   *     or a TemplateRef to instantiate as the content.
   * @param dialogContainer Reference to the wrapping MatDialogContainer.
   * @param overlayRef Reference to the overlay in which the dialog resides.
   * @param config The dialog configuration.
   * @returns A promise resolving to the MatDialogRef that should be returned to the user.
   */
  protected _attachDialogContentForComponent<T>(
      componentOrTemplateRef: ComponentType<T>,
      dialogContainer: ModalContainerComponent,
      overlayRef: OverlayRef,
      config: ModalConfig): ModalRef<any> {

    // Create a reference to the dialog we're creating in order to give the user a handle
    // to modify and close it.
    const dialogRef = new this.dialogRefConstructor(overlayRef, dialogContainer, config.id)
    const injector = this._createInjector<T>(config, dialogRef, dialogContainer)
    const contentRef = dialogContainer.attachComponentPortal(
        new ComponentPortal(componentOrTemplateRef, undefined, injector))

    dialogRef.componentInstance = contentRef.instance
    dialogRef.disableClose = config.disableClose

    dialogRef.updateSize({width: config.width, height: config.height})
             .updatePosition(config.position)

    return dialogRef
  }

  /**
   * Attaches the user-provided component to the already-created MatDialogContainer.
   * @param componentOrTemplateRef The type of component being loaded into the dialog,
   *     or a TemplateRef to instantiate as the content.
   * @param dialogContainer Reference to the wrapping MatDialogContainer.
   * @param overlayRef Reference to the overlay in which the dialog resides.
   * @param config The dialog configuration.
   * @returns A promise resolving to the MatDialogRef that should be returned to the user.
   */
  protected _attachDialogContentForTemplate<T>(
      componentOrTemplateRef: TemplateRef<T>,
      dialogContainer: ModalContainerComponent,
      overlayRef: OverlayRef,
      config: ModalConfig): ModalRef<any> {

    // Create a reference to the dialog we're creating in order to give the user a handle
    // to modify and close it.
    const dialogRef = new this.dialogRefConstructor(overlayRef, dialogContainer, config.id)

    dialogContainer.attachTemplatePortal(
      new TemplatePortal<T>(componentOrTemplateRef, <any>null,
        <any>{$implicit: config.data, dialogRef}))
    dialogRef.updateSize({width: config.width, height: config.height})
             .updatePosition(config.position)

    return dialogRef
  }


  /**
   * Creates a custom injector to be used inside the dialog. This allows a component loaded inside
   * of a dialog to close itself and, optionally, to return a value.
   * @param config Config object that is used to construct the dialog.
   * @param dialogRef Reference to the dialog.
   * @param container Dialog container element that wraps all of the contents.
   * @returns The custom injector that can be used inside the dialog.
   */
  private _createInjector<T>(
      config: ModalConfig,
      dialogRef: ModalRef<T>,
      dialogContainer: ModalContainerComponent): PortalInjector {

    const userInjector = config && config.viewContainerRef && config.viewContainerRef.injector
    const injectionTokens = new WeakMap<any, any>([
      [this.injector.get(MODAL_REF), dialogRef],
      [this.injector.get(MODAL_CONTAINER), dialogContainer],
      [MODAL_DATA, config.data]
    ])

    if (config.direction &&
        (!userInjector || !userInjector.get<Directionality | null>(Directionality, null))) {
      injectionTokens.set(Directionality, {
        value: config.direction,
        change: observableOf()
      })
    }

    return new PortalInjector(userInjector || this.injector, injectionTokens)
  }

  /**
   * Expands the provided configuration object to include the default values for properties which
   * are undefined.
   */
  private _applyConfigDefaults(config?: ModalConfig): ModalConfig {
    const dialogConfig = (<unknown>this.injector.get(MODAL_CONFIG)) as typeof ModalConfig
    return {...new dialogConfig(), ...config}
  }
}

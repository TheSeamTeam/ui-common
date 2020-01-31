import { BasePortalOutlet, CdkPortalOutletAttachedRef, ComponentPortal, Portal, TemplatePortal } from '@angular/cdk/portal'
import { DOCUMENT } from '@angular/common'
import {
  ComponentFactoryResolver,
  ComponentRef,
  Directive,
  ElementRef,
  EmbeddedViewRef,
  EventEmitter,
  Inject,
  OnDestroy,
  OnInit,
  Output,
  ViewContainerRef
} from '@angular/core'

/**
 * Mostly copied from
 * `https://github.com/angular/components/blob/master/src/cdk/portal/portal-directives.ts`
 * until I can figure out how to hold off removing the DOM nodes with the
 * cdkPortalOutlet.
 *
 * Directive version of a PortalOutlet. Because the directive *is* a
 * PortalOutlet, portals can be directly attached to it, enabling declarative
 * use.
 *
 * Usage: `<ng-template [cdkPortalOutlet]="greeting"></ng-template>`
 */
@Directive({
  selector: '[seamDashboardWidgetPortalOutlet]',
  exportAs: 'seamDashboardWidgetPortalOutlet',
  inputs: ['portal: seamDashboardWidgetPortalOutlet']
})
export class DashboardWidgetPortalOutletDirective extends BasePortalOutlet implements OnInit, OnDestroy {
  /** Whether the portal component is initialized. */
  private _isInitialized = false

  /** Reference to the currently-attached component/view ref. */
  private _attachedRef: CdkPortalOutletAttachedRef

  constructor(
      private _componentFactoryResolver: ComponentFactoryResolver,
      private _viewContainerRef: ViewContainerRef,
      private _elementRef: ElementRef
  ) {
    super()
  }

  /** Portal associated with the Portal outlet. */
  get portal(): Portal<any> | null {
    return this._attachedPortal
  }

  set portal(portal: Portal<any> | null) {
    console.log('[DashboardWidgetPortalOutletDirective] set portal', portal, this.hasAttached())
    // Ignore the cases where the `portal` is set to a falsy value before the lifecycle hooks have
    // run. This handles the cases where the user might do something like `<div cdkPortalOutlet>`
    // and attach a portal programmatically in the parent component. When Angular does the first CD
    // round, it will fire the setter with empty string, causing the user's content to be cleared.
    if (this.hasAttached() && !portal && !this._isInitialized) {
      return
    }

    if (this.hasAttached()) {
      super.detach()
    }

    if (portal) {
      super.attach(portal)
    }

    this._attachedPortal = portal
  }

  /** Emits when a portal is attached to the outlet. */
  @Output() attached: EventEmitter<CdkPortalOutletAttachedRef> =
      new EventEmitter<CdkPortalOutletAttachedRef>()

  /** Component or view reference that is attached to the portal. */
  get attachedRef(): CdkPortalOutletAttachedRef {
    return this._attachedRef
  }

  ngOnInit() {
    this._isInitialized = true
  }

  ngOnDestroy() {
    console.log('[DashboardWidgetPortalOutletDirective] ngOnDestroy')
    // TODO: Figure out the right way to call dispose without messing up animation.
    // super.dispose()
    // this._attachedPortal = null
    // this._attachedRef = null
  }

  /**
   * Attach the given ComponentPortal to this PortalOutlet using the ComponentFactoryResolver.
   *
   * @param portal Portal to be attached to the portal outlet.
   * @returns Reference to the created component.
   */
  attachComponentPortal<T>(portal: ComponentPortal<T>): ComponentRef<T> {
    portal.setAttachedHost(this)

    // If the portal specifies an origin, use that as the logical location of the component
    // in the application tree. Otherwise use the location of this PortalOutlet.
    const viewContainerRef = portal.viewContainerRef != null ?
        portal.viewContainerRef :
        this._viewContainerRef

    const resolver = portal.componentFactoryResolver || this._componentFactoryResolver
    const componentFactory = resolver.resolveComponentFactory(portal.component)
    const ref = viewContainerRef.createComponent(
        componentFactory, viewContainerRef.length,
        portal.injector || viewContainerRef.injector)

    super.setDisposeFn(() => ref.destroy())
    this._attachedPortal = portal
    this._attachedRef = ref
    this.attached.emit(ref)

    return ref
  }

  /**
   * Attach the given TemplatePortal to this PortlHost as an embedded View.
   * @param portal Portal to be attached.
   * @returns Reference to the created embedded view.
   */
  attachTemplatePortal<C>(portal: TemplatePortal<C>): EmbeddedViewRef<C> {
    portal.setAttachedHost(this)
    const viewRef = this._viewContainerRef.createEmbeddedView(portal.templateRef, portal.context)
    super.setDisposeFn(() => this._viewContainerRef.clear())

    this._attachedPortal = portal
    this._attachedRef = viewRef
    this.attached.emit(viewRef)

    return viewRef
  }

  // static ngAcceptInputType_portal: Portal<any> | null | undefined | '';
}

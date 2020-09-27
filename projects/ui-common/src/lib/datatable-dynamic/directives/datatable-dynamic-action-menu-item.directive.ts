import { LocationStrategy } from '@angular/common'
import {
  Attribute,
  ChangeDetectorRef,
  Directive,
  ElementRef,
  Input,
  isDevMode,
  OnChanges,
  OnDestroy,
  OnInit,
  Optional,
  Renderer2
} from '@angular/core'
import { ActivatedRoute, QueryParamsHandling, Router, RouterLink, RouterLinkWithHref } from '@angular/router'
import { from, fromEvent, Observable, of, ReplaySubject, Subscription } from 'rxjs'
import { catchError, mapTo, switchMap, tap } from 'rxjs/operators'

import {
  DynamicActionHelperService,
  DynamicActionUiAnchorDef,
  DynamicActionUiButtonDef,
  DynamicActionUiDef,
  DynamicValue,
  DynamicValueHelperService
} from '../../dynamic/index'
import { AssetReaderHelperService } from '../../services/index'
import { getAttribute, hasProperty, toggleAttribute } from '../../utils/index'

import { DynamicDatatableRow } from '../datatable-dynamic-def'
import type { DynamicDatatableActionMenuRecord } from '../models/dynamic-datatable-action-menu-record'
import { DynamicDatatableRowAction } from '../models/dynamic-datatable-row-action'
import { DynamicDatatableRowActionContext } from '../models/dynamic-datatable-row-action-context'

/**
 * Class to act as a substitute to `routerLink` directive until the menu items
 * can be dynamically built in a clean way with or without `routerLink`.
 */
export class DatatableDynamicActionMenuItemRouterLink {

  private _rLink?: RouterLink
  private _rLinkWithHref?: RouterLinkWithHref

  // private _clickSubscription?: Subscription
  private _rLinkClickEventListener?: any

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    @Attribute('tabindex') tabIndex: string | null,
    private renderer: Renderer2,
    private el: ElementRef,
    private locationStrategy: LocationStrategy
  ) {
    if (el.nativeElement.nodeName.toLowerCase() === 'a') {
      this._rLinkWithHref = new RouterLinkWithHref(
        router,
        route,
        locationStrategy
      )
      // console.log('rLinkWithHref', this.rLinkWithHref)

      this._rLinkClickEventListener = this.el.nativeElement.addEventListener('click', event => {
        // console.log('this._rLinkWithHref', this._rLinkWithHref, this._rLinkWithHref && this._rLinkWithHref.href)
        if (this._rLinkWithHref) {
          return this._rLinkWithHref.onClick(event.button, event.ctrlKey, event.shiftKey, event.altKey, event.metaKey)
        }
      })
    } else {
      this._rLink = new RouterLink(
        router,
        route,
        tabIndex as string,
        renderer,
        el
      )
      // console.log('rLink', this.rLink)

      this._rLinkClickEventListener = this.el.nativeElement.addEventListener('click', () => {
        // console.log('this._rLink', this._rLink && this._rLink.urlTree)
        if (this._rLink) { return this._rLink.onClick() }
      })

      // this._clickSubscription = fromEvent(el.nativeElement, 'click')
      //   .subscribe(() => {
      //     if (this._rLink) {
      //       this._rLink.onClick()
      //     } else {
      //       if (this._clickSubscription && !this._clickSubscription.closed) {
      //         this._clickSubscription.unsubscribe()
      //       }
      //     }
      //   })
    }
  }

  get routerLink(): RouterLink | undefined { return this._rLink }
  get routerLinkWithHref(): RouterLinkWithHref | undefined { return this._rLinkWithHref }

  set routerLinkInput(commands: any[] | string) {
    if (this._rLink) {
      this._rLink.routerLink = commands
    } else if (this._rLinkWithHref) {
      this._rLinkWithHref.routerLink = commands
    }
  }

  set queryParams(value: { [k: string]: any }) {
    if (this._rLink) {
      this._rLink.queryParams = value
    } else if (this._rLinkWithHref) {
      this._rLinkWithHref.queryParams = value
    }
  }

  set fragment(value: string) {
    if (this._rLink) {
      this._rLink.fragment = value
    } else if (this._rLinkWithHref) {
      this._rLinkWithHref.fragment = value
    }
  }

  set queryParamsHandling(value: QueryParamsHandling) {
    if (this._rLink) {
      this._rLink.queryParamsHandling = value
    } else if (this._rLinkWithHref) {
      this._rLinkWithHref.queryParamsHandling = value
    }
  }

  set preserveFragment(value: boolean) {
    if (this._rLink) {
      this._rLink.preserveFragment = value
    } else if (this._rLinkWithHref) {
      this._rLinkWithHref.preserveFragment = value
    }
  }

  set skipLocationChange(value: boolean) {
    if (this._rLink) {
      this._rLink.skipLocationChange = value
    } else if (this._rLinkWithHref) {
      this._rLinkWithHref.skipLocationChange = value
    }
  }

  set replaceUrl(value: boolean) {
    if (this._rLink) {
      this._rLink.replaceUrl = value
    } else if (this._rLinkWithHref) {
      this._rLinkWithHref.replaceUrl = value
    }
  }

  set state(value: { [k: string]: any }) {
    if (this._rLink) {
      this._rLink.state = value
    } else if (this._rLinkWithHref) {
      this._rLinkWithHref.state = value
    }
  }

  set target(value: string | undefined) {
    if (this._rLinkWithHref) {
      this._rLinkWithHref.target = value as string

      if (value) {
        this.renderer.setAttribute(this.el.nativeElement, 'target', value)
      } else {
        toggleAttribute(this.el.nativeElement, 'target', false)
      }
    }
  }

  public destroy() {
    // if (this._clickSubscription && !this._clickSubscription.closed) {
    //   this._clickSubscription.unsubscribe()
    // }
    if (this._rLinkClickEventListener) {
      this.el.nativeElement.removeEventListener('click', this._rLinkClickEventListener)
      this._rLinkClickEventListener = null
    }

    if (this._rLinkWithHref && this._rLinkWithHref.ngOnDestroy) {
      this._rLinkWithHref.ngOnDestroy()
    }
  }

}

// TODO: Refactor this directive. It got way more complex instead of more
// simplified like it was supposed to be.
@Directive({
  selector: '[seamDatatableDynamicActionMenuItem]',
  exportAs: 'seamDatatableDynamicActionMenuItem'
})
export class DatatableDynamicActionMenuItemDirective implements OnInit, OnDestroy, OnChanges {

  @Input()
  // get seamDatatableDynamicActionMenuItem(): DynamicDatatableActionMenuRecord { return this._record }
  set seamDatatableDynamicActionMenuItem(value: DynamicDatatableActionMenuRecord) {
    this._record.next(value)
  }
  private _record = new ReplaySubject<DynamicDatatableActionMenuRecord>(1)

  private _clickSubscription: Subscription
  private _menuRouterLink?: DatatableDynamicActionMenuItemRouterLink

  private _recordSubscription = Subscription.EMPTY

  constructor(
    private _elementRef: ElementRef<HTMLElement>,
    private _renderer: Renderer2,
    private _valueHelper: DynamicValueHelperService,
    private _actionHelper: DynamicActionHelperService,
    private _assetReaderHelper: AssetReaderHelperService,
    private _router: Router,
    private _route: ActivatedRoute,
    private _locationStrategy: LocationStrategy
  ) {
    this._recordSubscription = this._record.pipe(
      // tap(v => console.log('record', v)),
      switchMap(record => this._update(record)),
      tap(() => { this._setInvalidActionState(false) }),
      catchError(error => {
        if (isDevMode()) { console.error(error) }
        this._setInvalidActionState(true)
        return of(undefined)
      }),
      // tap(v => console.log('record DONE', v))
    ).subscribe()
  }

  ngOnInit() { }

  ngOnDestroy() {
    this._recordSubscription.unsubscribe()
    this._unsubClick()
    if (this._menuRouterLink && this._menuRouterLink.routerLinkWithHref) {
      this._menuRouterLink.routerLinkWithHref.ngOnDestroy()
    }
  }

  ngOnChanges(changes: {}) {
    // console.log('ngOnChanges', changes, this, this._menuRouterLink)
    if (this._menuRouterLink && this._menuRouterLink.routerLinkWithHref) {
      this._menuRouterLink.routerLinkWithHref.ngOnChanges({})
      if (this._menuRouterLink.routerLinkWithHref.href) {
        if (getAttribute(this._elementRef.nativeElement, 'href') !== this._menuRouterLink.routerLinkWithHref.href) {
          this._renderer.setAttribute(this._elementRef.nativeElement, 'href', this._menuRouterLink.routerLinkWithHref.href)
        }
      } else {
        toggleAttribute(this._elementRef.nativeElement, 'href', false)
      }
    }
  }

  public _update(record: DynamicDatatableActionMenuRecord): Observable<void> {
    this._unsubClick()

    return from(this._getUiProps(record)).pipe(
      switchMap(uiProps => this._isAnchor()
        ? this._updateAnchorElement(record, uiProps as DynamicActionUiAnchorDef)
        : this._updateButtonElement(record, uiProps as DynamicActionUiButtonDef)
      )
    )
  }

  private _updateAnchorElement(
    record: DynamicDatatableActionMenuRecord,
    uiProps: DynamicActionUiAnchorDef
  ): Observable<void> {
    const _stream: Observable<any> = of(undefined)

    switch (uiProps.triggerType) {
      case 'link': {
        // console.log('Handle "link" triggerType.', uiProps)
        // this._tryInitTabIndex()
        this._tryInitBlockClick(record, uiProps)
        this._initMenuItemRouterLink(record, uiProps)

        break
      }
      case 'link-external': {
        // console.log('Handle "link-external" triggerType.', uiProps)
        // this._tryInitTabIndex()
        this._tryInitBlockClick(record, uiProps)
        if (hasProperty(uiProps, 'linkUrl')) {
          this._setAttr('href', uiProps.linkUrl)
        }
        if (hasProperty(uiProps, 'linkExtras')) {
          if (hasProperty(uiProps.linkExtras, 'target')) {
            this._setAttr('target', uiProps.linkExtras.target)
          }
        }
        // TODO: Consider making the ItemRouterLink work with external urls.
        // this._initMenuItemRouterLink(record, uiProps)

        break
      }
      // TODO: Unless we decide to add a route for openning assets, this would
      // be confusing to a user.
      // case 'link-asset': {
      //   console.log('Handle "link-asset" triggerType.', uiProps)
      //   // this._tryInitTabIndex()
      //   this._tryInitBlockClick(record, uiProps)
      //   break
      // }
      default: throw Error('[DatatableDynamicActionMenuItemDirective] ' +
        `triggerType ${uiProps.triggerType} is not valid for _updateAnchorElement().`)
    }

    return _stream// .pipe(mapTo(undefined))
  }

  private _updateButtonElement(
    record: DynamicDatatableActionMenuRecord,
    uiProps: DynamicActionUiAnchorDef | DynamicActionUiButtonDef
  ): Observable<void> {
    let _stream: Observable<any> = of(undefined)
    // this._updateClickElement(record, uiProps as DynamicActionUiButtonDef)
    switch (uiProps.triggerType) {
      case 'link-asset': {
        // console.log('Handle "link-asset" triggerType.', uiProps)
        // this._tryInitTabIndex()
        this._tryInitBlockClick(record, uiProps)
        _stream = _stream.pipe(switchMap(() => this._updateAssetElement(record, uiProps)))
        break
      }
      case 'click': {
        // console.log('Handle "click" triggerType.', uiProps)
        this._tryInitBlockClick(record, uiProps)
        _stream = _stream.pipe(switchMap(() => this._updateClickElement(record, uiProps)))
        break
      }
      default: throw Error('[DatatableDynamicActionMenuItemDirective] ' +
        `triggerType ${uiProps.triggerType} is not valid for _updateAnchorElement().`)
    }

    return _stream// .pipe(mapTo(undefined))
  }

  private _updateAssetElement(
    record: DynamicDatatableActionMenuRecord,
    uiProps: DynamicActionUiAnchorDef | DynamicActionUiButtonDef
  ): Observable<void> {
    // console.log('_updateAssetElement')
    // return of(undefined)
    // console.log('this._elementRef.nativeElement', this._elementRef.nativeElement)
    const t = fromEvent(this._elementRef.nativeElement, 'click').pipe(
      tap(event => {
        // const _context = this._getContext(record._row, record.rowAction)
        // const context = { ..._context, event, uiProps }
        // const result = this._valueHelper.evalSync(uiProps.blockClickExpr, context)
        // console.log(record, uiProps)
        // console.log('_updateClickElement click', (<any>event).button, event)
        if (this._assetReaderHelper) {
          if (uiProps.triggerType === 'link-asset' && hasProperty(uiProps, 'linkUrl')) {
            const url = uiProps.linkUrl
            let target: string | undefined
            if (hasProperty(uiProps, 'linkExtras') && hasProperty(uiProps.linkExtras, 'target')) {
              target = uiProps.linkExtras.target
            }
            this._assetReaderHelper.openLink(url, true, true, target)
          }
        }
        // if (!result) {
        //   event.preventDefault()
        //   event.stopPropagation()
        // }
      }),
      mapTo(undefined)
    )

    return of(undefined).pipe(
      // tap(() => console.log('starting _updateButtonElement')),
      switchMap(() => t),
    )
  }

  private _updateClickElement(
    record: DynamicDatatableActionMenuRecord,
    uiProps: DynamicActionUiButtonDef
  ): Observable<void> {
    // console.log('_updateClickElement', record, uiProps)
    // return of(undefined)
    return fromEvent(this._elementRef.nativeElement, 'click').pipe(
      switchMap(event => {
        const _context = this._getContext(record._row, record.rowAction)
        const context = { ..._context, event, uiProps }
        // console.log('click', (<any>event).button, event)
        // if (!result) {
        //   event.preventDefault()
        //   event.stopPropagation()
        // }

        return this._actionHelper.exec(uiProps._actionDef, context)
      }),
      mapTo(undefined)
    )
  }

  private _unsubClick() {
    if (this._clickSubscription && !this._clickSubscription.closed) {
      this._clickSubscription.unsubscribe()
    }
  }

  private _setAttr(attr: string, value: string) {
    this._renderer.setAttribute(this._elementRef.nativeElement, attr, value)
  }

  private _tryInitTabIndex() {
    if (getAttribute(this._elementRef.nativeElement, 'tabindex') === null) {
      this._renderer.setAttribute(this._elementRef.nativeElement, 'tabindex', '0')
    }
  }

  private _tryInitBlockClick(
    record: DynamicDatatableActionMenuRecord,
    uiProps: DynamicActionUiDef
  ) {
    this._unsubClick()
    if (hasProperty(uiProps, 'blockClickExpr')) {
      this._clickSubscription = this._blockClickExprObservable(uiProps, record).subscribe()
    }
  }

  private _blockClickExprObservable(
    uiProps: DynamicActionUiDef,
    record: DynamicDatatableActionMenuRecord
  ) {
    return fromEvent(this._elementRef.nativeElement, 'click').pipe(
      tap(event => {
        const _context = this._getContext(record._row, record.rowAction)
        const context = { ..._context, event, uiProps }
        const result = this._valueHelper.evalSync(uiProps.blockClickExpr, context)
        // console.log('click', result, (<any>event).button, event)
        if (!result) {
          event.preventDefault()
          event.stopPropagation()
        }
      }),
      mapTo(undefined)
    )
  }

  private _initMenuItemRouterLink(
    record: DynamicDatatableActionMenuRecord,
    uiProps: DynamicActionUiAnchorDef
  ) {
    this._menuRouterLink = new DatatableDynamicActionMenuItemRouterLink(
      this._router,
      this._route,
      getAttribute(this._elementRef.nativeElement, 'tabindex'),
      this._renderer,
      this._elementRef,
      this._locationStrategy
    )
    // console.log(this._menuRouterLink)

    this._menuRouterLink.routerLinkInput = uiProps.linkUrl as string

    if (hasProperty(uiProps, 'linkExtras')) {
      if (hasProperty(uiProps.linkExtras, 'target')) {
        this._menuRouterLink.target = uiProps.linkExtras.target
      }
      if (hasProperty(uiProps.linkExtras, 'queryParams')) {
        this._menuRouterLink.queryParams = uiProps.linkExtras.queryParams
      }
      if (hasProperty(uiProps.linkExtras, 'fragment')) {
        this._menuRouterLink.fragment = uiProps.linkExtras.fragment
      }
      if (hasProperty(uiProps.linkExtras, 'queryParamsHandling')) {
        this._menuRouterLink.queryParamsHandling = uiProps.linkExtras.queryParamsHandling
      }
      if (hasProperty(uiProps.linkExtras, 'preserveFragment')) {
        this._menuRouterLink.preserveFragment = uiProps.linkExtras.preserveFragment
      }
      if (hasProperty(uiProps.linkExtras, 'skipLocationChange')) {
        this._menuRouterLink.skipLocationChange = uiProps.linkExtras.skipLocationChange
      }
      if (hasProperty(uiProps.linkExtras, 'replaceUrl')) {
        this._menuRouterLink.replaceUrl = uiProps.linkExtras.replaceUrl
      }
      if (hasProperty(uiProps.linkExtras, 'state')) {
        this._menuRouterLink.state = uiProps.linkExtras.state
      }
    }

    this.ngOnChanges({})
  }

  private _isAnchor(): boolean {
    return this._elementRef.nativeElement.nodeName.toLowerCase() === 'a'
  }

  private _getUiProps(record: DynamicDatatableActionMenuRecord): Promise<DynamicActionUiDef> {
    const context = this._getContext(record._row, record.rowAction)
    return this._actionHelper.getUiProps(record.rowAction.action, context)
  }

  /** @ignore */
  private _getContext(row: DynamicDatatableRow,  rowActionDef: DynamicDatatableRowAction): DynamicDatatableRowActionContext {
    return {
      row
    }
  }

  private _setInvalidActionState(invalid: boolean = false) {
    const element = this._elementRef.nativeElement
    toggleAttribute(element, 'disabled', invalid)
  }

}

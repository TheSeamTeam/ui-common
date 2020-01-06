import { LocationStrategy } from '@angular/common'
import { Attribute, Directive, ElementRef, Input, isDevMode, OnChanges, OnDestroy, OnInit, Renderer2 } from '@angular/core'
import { ActivatedRoute, QueryParamsHandling, Router, RouterLink, RouterLinkWithHref } from '@angular/router'
import { from, fromEvent, Observable, of, ReplaySubject, Subscription } from 'rxjs'
import { catchError, mapTo, switchMap, tap } from 'rxjs/operators'

import { untilDestroyed } from 'ngx-take-until-destroy'

import {
  DynamicActionHelperService,
  DynamicValue,
  DynamicValueHelperService,
  IDynamicActionUiAnchorDef,
  IDynamicActionUiButtonDef,
  IDynamicActionUiDef
} from '../../dynamic/index'
import { AssetReaderHelperService } from '../../services/index'
import { getAttribute, hasProperty, toggleAttribute } from '../../utils/index'

import { IDynamicDatatableRow } from '../datatable-dynamic-def'
import { IDynamicDatatableActionMenuRecord } from '../models/dynamic-datatable-action-menu-record'
import { IDynamicDatatableRowAction } from '../models/dynamic-datatable-row-action'
import { IDynamicDatatableRowActionContext } from '../models/dynamic-datatable-row-action-context'

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
        if (this._rLinkWithHref) {
          return this._rLinkWithHref.onClick(event.button, event.ctrlKey, event.metaKey, event.shiftKey)
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

@Directive({
  selector: '[seamDatatableDynamicActionMenuItem]',
  exportAs: 'seamDatatableDynamicActionMenuItem'
})
export class DatatableDynamicActionMenuItemDirective implements OnInit, OnDestroy, OnChanges {

  @Input()
  // get seamDatatableDynamicActionMenuItem(): IDynamicDatatableActionMenuRecord { return this._record }
  set seamDatatableDynamicActionMenuItem(value: IDynamicDatatableActionMenuRecord) {
    this._record.next(value)
  }
  private _record = new ReplaySubject<IDynamicDatatableActionMenuRecord>(1)

  private _clickSubscription: Subscription
  private _menuRouterLink?: DatatableDynamicActionMenuItemRouterLink

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
    this._record.pipe(
      tap(v => console.log('record', v)),
      switchMap(record => this._update(record)),
      tap(() => { this._setInvalidActionState(false) }),
      catchError(error => {
        if (isDevMode()) { console.error(error) }
        this._setInvalidActionState(true)
        return of(undefined)
      }),
      tap(v => console.log('record DONE', v)),
      untilDestroyed(this)
    ).subscribe()
  }

  ngOnInit() { }

  ngOnDestroy() {
    if (this._menuRouterLink && this._menuRouterLink.routerLinkWithHref) {
      this._menuRouterLink.routerLinkWithHref.ngOnDestroy()
    }
  }

  ngOnChanges(changes: {}) {
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

  public _update(record: IDynamicDatatableActionMenuRecord): Observable<void> {
    this._unsubClick()

    return from(this._getUiProps(record)).pipe(
      switchMap(uiProps => this._isAnchor()
        ? this._updateAnchorElement(record, uiProps as IDynamicActionUiAnchorDef)
        : this._updateClickElement(record, uiProps as IDynamicActionUiButtonDef)
      )
    )
  }

  private _updateAnchorElement(
    record: IDynamicDatatableActionMenuRecord,
    uiProps: IDynamicActionUiAnchorDef
  ): Observable<void> {
    const _stream: Observable<any> = of(undefined)

    switch (uiProps.triggerType) {
      case 'link': {
        console.log('Handle "link" triggerType.', uiProps)
        // this._tryInitTabIndex()
        this._tryInitBlockClick(record, uiProps)
        this._initMenuItemRouterLink(record, uiProps)

        break
      }
      case 'link-external': {
        console.log('Handle "link-external" triggerType.', uiProps)
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
      case 'link-asset': {
        console.log('Handle "link-asset" triggerType.', uiProps)
        // this._tryInitTabIndex()
        this._tryInitBlockClick(record, uiProps)
        break
      }
      default: throw Error('[DatatableDynamicActionMenuItemDirective] ' +
        `triggerType ${uiProps.triggerType} is not valid for _updateAnchorElement().`)
    }

    return _stream// .pipe(mapTo(undefined))
  }

  private _updateClickElement(
    record: IDynamicDatatableActionMenuRecord,
    uiProps: IDynamicActionUiButtonDef
  ): Observable<void> {

    return of(undefined)
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
    record: IDynamicDatatableActionMenuRecord,
    uiProps: IDynamicActionUiDef
  ) {
    this._unsubClick()
    if (hasProperty(uiProps, 'blockClickExpr')) {
      this._clickSubscription = this._blockClickExprObservable(uiProps, record).pipe(
        untilDestroyed(this)
      ).subscribe()
    }
  }

  private _blockClickExprObservable(
    uiProps: IDynamicActionUiDef,
    record: IDynamicDatatableActionMenuRecord
  ) {
    return fromEvent(this._elementRef.nativeElement, 'click').pipe(
      tap(event => {
        const _context = this._getContext(record._row, record.rowAction)
        const context = { ..._context, event, uiProps }
        const result = this._valueHelper.evalSync(uiProps.blockClickExpr, context)
        console.log('click', result, (<any>event).button, event)
        if (!result) {
          event.preventDefault()
          event.stopPropagation()
        }
      }),
      mapTo(undefined)
    )
  }

  private _initMenuItemRouterLink(
    record: IDynamicDatatableActionMenuRecord,
    uiProps: IDynamicActionUiAnchorDef
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

    if (uiProps.linkExtras) {
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
  }

  private _isAnchor(): boolean {
    return this._elementRef.nativeElement.nodeName.toLowerCase() === 'a'
  }

  private _getUiProps(record: IDynamicDatatableActionMenuRecord): Promise<IDynamicActionUiDef> {
    const context = this._getContext(record._row, record.rowAction)
    return this._actionHelper.getUiProps(record.rowAction.action, context)
  }

  /** @ignore */
  private _getContext(row: IDynamicDatatableRow,  rowActionDef: IDynamicDatatableRowAction): IDynamicDatatableRowActionContext {
    return {
      row
    }
  }

  private _setInvalidActionState(invalid: boolean = false) {
    const element = this._elementRef.nativeElement
    toggleAttribute(element, 'disabled', invalid)
  }

}

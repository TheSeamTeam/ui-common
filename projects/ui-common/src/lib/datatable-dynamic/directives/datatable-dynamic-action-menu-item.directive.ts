import { Directive, ElementRef, Input, isDevMode, OnDestroy, OnInit, Renderer2 } from '@angular/core'
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
import { hasProperty, toggleAttribute } from '../../utils/index'

import { IDynamicDatatableRow } from '../datatable-dynamic-def'
import { IDynamicDatatableActionMenuRecord } from '../models/dynamic-datatable-action-menu-record'
import { IDynamicDatatableRowAction } from '../models/dynamic-datatable-row-action'
import { IDynamicDatatableRowActionContext } from '../models/dynamic-datatable-row-action-context'


@Directive({
  selector: '[seamDatatableDynamicActionMenuItem]',
  exportAs: 'seamDatatableDynamicActionMenuItem'
})
export class DatatableDynamicActionMenuItemDirective implements OnInit, OnDestroy {

  @Input()
  // get seamDatatableDynamicActionMenuItem(): IDynamicDatatableActionMenuRecord { return this._record }
  set seamDatatableDynamicActionMenuItem(value: IDynamicDatatableActionMenuRecord) {
    this._record.next(value)
  }
  private _record = new ReplaySubject<IDynamicDatatableActionMenuRecord>(1)

  // private _clickSubscription: Subscription

  constructor(
    private _elementRef: ElementRef<HTMLElement>,
    private _renderer: Renderer2,
    private _valueHelper: DynamicValueHelperService,
    private _actionHelper: DynamicActionHelperService,
    private _assetReaderHelper: AssetReaderHelperService
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
      untilDestroyed(this)
    ).subscribe()
  }

  ngOnInit() { }

  ngOnDestroy() {}

  public _update(record: IDynamicDatatableActionMenuRecord): Observable<void> {
    // this._unsubClick()

    return from(this._getUiProps(record)).pipe(
      switchMap(uiProps => this._isAnchor()
        ? this._updateAnchorElement(record, uiProps)
        : this._updateClickElement(record, uiProps)
      )
    )
  }

  private _updateAnchorElement(
    record: IDynamicDatatableActionMenuRecord,
    uiProps: IDynamicActionUiDef
  ): Observable<void> {
    const _uiProps = uiProps as IDynamicActionUiAnchorDef

    const _stream: Observable<any> = of(undefined)

    switch (_uiProps.triggerType) {
      case 'link': {
        console.log('Handle "link" triggerType.')
        if (hasProperty(record.rowAction.action, 'blockClickExpr')) {
          const expr = record.rowAction.action.blockClickExpr
          _stream.pipe(switchMap(() => this._blockClickExprObservable(expr, record)))
        }
        break
      }
      case 'link-external': {
        console.log('Handle "link" triggerType.')
        if (hasProperty(record.rowAction.action, 'blockClickExpr')) {
          const expr = record.rowAction.action.blockClickExpr
          _stream.pipe(switchMap(() => this._blockClickExprObservable(expr, record)))
        }
        break
      }
      case 'link-asset': {
        console.log('Handle "link" triggerType.')
        if (hasProperty(record.rowAction.action, 'blockClickExpr')) {
          const expr = record.rowAction.action.blockClickExpr
          _stream.pipe(switchMap(() => this._blockClickExprObservable(expr, record)))
        }
        break
      }
      default: throw Error('[DatatableDynamicActionMenuItemDirective] ' +
        `triggerType ${_uiProps.triggerType} is not valid for _updateAnchorElement().`)
    }

    return _stream.pipe(mapTo(undefined))
  }

  private _updateClickElement(
    record: IDynamicDatatableActionMenuRecord,
    uiProps: IDynamicActionUiDef
  ): Observable<void> {
    const _uiProps = uiProps as IDynamicActionUiButtonDef

    return of(undefined)
  }

  // private _unsubClick() {
  //   if (this._clickSubscription && !this._clickSubscription.closed) {
  //     this._clickSubscription.unsubscribe()
  //   }
  // }

  private _blockClickExprObservable(
    blockClickExpr: DynamicValue<boolean>,
    record: IDynamicDatatableActionMenuRecord
  ) {
    return fromEvent(this._elementRef.nativeElement, 'click').pipe(
      tap(event => {
        const _context = this._getContext(record._row, record.rowAction)
        const context = { ..._context, event }
        const result = this._valueHelper.evalSync(blockClickExpr, context)
        if (!result) {
          event.preventDefault()
          event.stopPropagation()
        }
      }),
      mapTo(undefined)
    )
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

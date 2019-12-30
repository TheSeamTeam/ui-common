import { Directive, ElementRef, Input, OnDestroy, OnInit } from '@angular/core'
import { ReplaySubject } from 'rxjs'

import { untilDestroyed } from 'ngx-take-until-destroy'

import { IDynamicDatatableActionMenuRecord } from '../models/dynamic-datatable-action-menu-record'

@Directive({
  selector: '[seamDatatableDynamicActionMenuItem]',
  exportAs: 'seamDatatableDynamicActionMenuItem'
})
export class DatatableDynamicActionMenuItemDirective implements OnInit, OnDestroy {

  @Input()
  get seamDatatableDynamicActionMenuItem(): IDynamicDatatableActionMenuRecord { return this._record }
  set seamDatatableDynamicActionMenuItem(value: IDynamicDatatableActionMenuRecord) {
    this._record = value
  }
  private _record: IDynamicDatatableActionMenuRecord

  constructor(
    private _elementRef: ElementRef
  ) { }

  ngOnInit() { }

  ngOnDestroy() {}

  public update() {

  }

  private _isAnchor(): boolean {
    return this._elementRef.nativeElement.nodeName.toLowerCase() === 'a'
  }

}

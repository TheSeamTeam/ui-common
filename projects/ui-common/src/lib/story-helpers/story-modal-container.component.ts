import { Component, Injector, Input, OnDestroy } from '@angular/core'
import { combineLatest, Observable, of, ReplaySubject } from 'rxjs'
import { auditTime, map, startWith, tap } from 'rxjs/operators'

import { untilDestroyed } from 'ngx-take-until-destroy'

import { MODAL_DATA, ModalRef } from '../modal/index'
import { ComponentType } from '../models/index'

class FakeModalRef<T, R = any> implements Partial<ModalRef<T, R>> {

  afterOpened() { return of(undefined) }

  close(dialogResult?: R): void { }

}

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'story-modal-container-component',
  template: `
    <div class="cdk-overlay-backdrop cdk-overlay-dark-backdrop cdk-overlay-backdrop-showing">
      <div class="seam-modal-container modal-dialog modal-dialog-centered modal-lg" tabindex="-1">
        <div class="modal-content">
          <ng-container *ngIf="_outletData$ | async as outletData">
            <ng-container *ngComponentOutlet="outletData.component; injector: outletData.injector;"></ng-container>
          </ng-container>
        </div>
      </div>
    </div>
  `
})
export class StoryModalContainerComponent<T, D = any> implements OnDestroy {

  @Input() set component(c: ComponentType<T>) { this._component.next(c) }
  @Input() set data(d: D) { this._data.next(d) }

  _component = new ReplaySubject<ComponentType<T>>(1)
  _data = new ReplaySubject<D>(1)

  _outletData$: Observable<{ component: ComponentType<T>, injector: Injector } | null>

  constructor(
    private _injector: Injector
  ) {
    this._outletData$ = combineLatest([
      this._component.asObservable(),
      this._data.asObservable().pipe(startWith(undefined))
    ]).pipe(
      auditTime(0),
      map(([ component, data ]) => ({
        component,
        injector: this._createInjector(data)
      })),
      untilDestroyed(this)
    )
  }

  ngOnDestroy() { }

  private _createInjector(data: D): Injector {
    return Injector.create({
      providers: [
        { provide: ModalRef, useClass: FakeModalRef, deps: [] },
        { provide: MODAL_DATA, useValue: data }
      ],
      parent: this._injector
    })
  }

}

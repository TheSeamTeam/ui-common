import { Component, Injector, Input, OnDestroy } from '@angular/core'
import { combineLatest, Observable, of, ReplaySubject, Subject } from 'rxjs'
import { auditTime, map, startWith, takeUntil } from 'rxjs/operators'

import { ModalRef, MODAL_DATA } from '../modal/index'
import { ComponentType } from '../models/index'

class FakeModalRef<T, R = any> implements Partial<ModalRef<T, R>> {

  afterOpened() { return of(undefined) }

  close(dialogResult?: R): void { }

}

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'story-modal-container-component',
  template: `
    <div class="cdk-overlay-container">
      <div class="cdk-overlay-backdrop cdk-overlay-dark-backdrop cdk-overlay-backdrop-showing"></div>
      <div class="cdk-global-overlay-wrapper"
        dir="ltr"
        style="justify-content: flex-start; align-items: center; pointer-events: auto"
        seamOverlayScrollbar>
        <div class="seam-modal-container modal-dialog modal-dialog-centered modal-lg" tabindex="-1">
          <div class="modal-content">
            <ng-container *ngIf="_outletData$ | async as outletData">
              <ng-container *ngComponentOutlet="outletData.component; injector: outletData.injector;"></ng-container>
            </ng-container>
          </div>
        </div>
      </div>
    </div>
  `
})
export class StoryModalContainerComponent<T, D = any> implements OnDestroy {

  private readonly _ngUnsubscribe = new Subject()

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
      takeUntil(this._ngUnsubscribe)
    )
  }

  ngOnDestroy() {
    this._ngUnsubscribe.next()
    this._ngUnsubscribe.complete()
  }

  private _createInjector(data?: D): Injector {
    return Injector.create({
      providers: [
        { provide: ModalRef, useClass: FakeModalRef, deps: [] },
        { provide: MODAL_DATA, useValue: data }
      ],
      parent: this._injector
    })
  }

}

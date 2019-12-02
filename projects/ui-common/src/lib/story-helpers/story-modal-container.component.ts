import { ComponentType } from '@angular/cdk/overlay'
import { Component, Injector, Input } from '@angular/core'
import { of } from 'rxjs'

import { ModalRef } from '../modal/index'

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
          <ng-container *ngIf="component">
            <ng-container *ngComponentOutlet="component; injector: myInjector;"></ng-container>
          </ng-container>
        </div>
      </div>
    </div>
  `
})
export class StoryModalContainerComponent<T> {

  @Input() component: ComponentType<T>

  myInjector: Injector

  constructor(
    injector: Injector
  ) {
    this.myInjector = Injector.create({
      providers: [{ provide: ModalRef, useClass: FakeModalRef, deps: [] }],
      parent: injector
    })
  }

}

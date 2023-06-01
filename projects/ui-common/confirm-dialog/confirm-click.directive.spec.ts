import { fakeAsync, flush, flushMicrotasks, tick } from '@angular/core/testing'
import { SpectatorElement } from '@ngneat/spectator'
import { createHostFactory, SpectatorHost } from '@ngneat/spectator/jest'

import { TheSeamModalModule } from '@theseam/ui-common/modal'
import { TheSeamScrollbarModule } from '@theseam/ui-common/scrollbar'

import { ConfirmClickDirective } from './confirm-click.directive'
import { ConfirmDialogComponent } from './confirm-dialog.component'
import { SeamConfirmDialogService } from './confirm-dialog.service'

// tslint:disable:no-non-null-assertion

describe('ConfirmClickDirective', () => {
  let host: SpectatorHost<ConfirmClickDirective>

  const createHost = createHostFactory({
    component: ConfirmClickDirective,
    providers: [
      SeamConfirmDialogService
    ],
    declarations: [
      ConfirmDialogComponent
    ],
    imports: [
      TheSeamModalModule,
      TheSeamScrollbarModule
    ],
    entryComponents: [
      ConfirmDialogComponent
    ]
  })

  it('should get the instance', () => {
    host = createHost(`<div seamConfirmClick>Testing ConfirmClickDirective</div>`)

    const instance = host.queryHost<ConfirmClickDirective>(
      ConfirmClickDirective
    )

    expect(instance).toBeDefined()
  })

  it('should open dialog on click', fakeAsync(() => {
    host = createHost(`<div seamConfirmClick class="test-btn">Testing ConfirmClickDirective</div>`)

    const instance = host.queryHost<ConfirmClickDirective>(
      ConfirmClickDirective
    )

    host.dispatchMouseEvent(host.element, 'click')

    tick(500)

    expect(instance?.modalRef).toBeDefined()
    expect(instance?.modalRef?.componentInstance).toBeDefined()

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const id = instance!.modalRef!.id

    expect(document.getElementById(id)).not.toBeNull()
  }))

  it('should stay open on dialog content click', fakeAsync(() => {
    host = createHost(`<div seamConfirmClick class="test-btn">Testing ConfirmClickDirective</div>`)

    const instance = host.queryHost<ConfirmClickDirective>(
      ConfirmClickDirective
    )

    host.dispatchMouseEvent(host.element, 'click')

    tick()

    expect(instance?.modalRef).toBeDefined()
    expect(instance?.modalRef?.componentInstance).toBeDefined()

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const id = instance!.modalRef!.id

    expect(document.getElementById(id)).not.toBeNull()

    host.dispatchMouseEvent(document.getElementById(id) as SpectatorElement, 'click')

    tick(500)

    expect(document.getElementById(id)).not.toBeNull()
  }))

  it('should close on click outside dialog content', fakeAsync(() => {
    host = createHost(`<div seamConfirmClick class="test-btn">Testing ConfirmClickDirective</div>`)

    const instance = host.queryHost<ConfirmClickDirective>(
      ConfirmClickDirective
    )

    host.dispatchMouseEvent(host.element, 'click')

    tick()

    expect(instance?.modalRef).toBeDefined()
    expect(instance?.modalRef?.componentInstance).toBeDefined()

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const id = instance!.modalRef!.id

    expect(document.getElementById(id)).not.toBeNull()

    host.dispatchMouseEvent(document.getElementById(id)?.parentElement as SpectatorElement, 'click')
    tick(500)

    expect(document.getElementById(id)).toBeNull()
  }))
})

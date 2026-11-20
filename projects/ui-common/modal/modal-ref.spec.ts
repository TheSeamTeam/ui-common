import { ESCAPE } from '@angular/cdk/keycodes'
import { OverlayContainer } from '@angular/cdk/overlay'
import {
  ApplicationRef,
  Component,
  TemplateRef,
  ViewChild,
  inject,
} from '@angular/core'
import { TestBed, fakeAsync, flush } from '@angular/core/testing'
import { provideNoopAnimations } from '@angular/platform-browser/animations'
import { Subject } from 'rxjs'

import { TheSeamModalModule } from './modal.module'
import { ModalConfig, TheSeamModalCanCloseFn } from './modal-config'
import { ModalRef } from './modal-ref'
import { Modal } from './modal.service'

@Component({
  selector: 'seam-test-next-modal-content',
  template: `<p>Next</p>`,
})
class TestNextModalContentComponent {}

@Component({
  selector: 'seam-test-modal-content',
  template: `
    <button id="test-close-btn" seamModalClose="from-button">Close</button>
    <button id="test-next-btn" seamModalClose [seamModalNext]="nextComponent">
      Next
    </button>
  `,
  imports: [TheSeamModalModule],
})
class TestModalContentComponent {
  readonly modalRef = inject(ModalRef)
  readonly nextComponent = TestNextModalContentComponent
}

@Component({
  selector: 'seam-test-guarded-modal-content',
  template: `<p>Guarded</p>`,
})
class TestGuardedModalContentComponent {
  constructor() {
    inject(ModalRef).canClose = () => false
  }
}

@Component({
  selector: 'seam-test-template-host',
  template: `<ng-template #tpl><p>Template modal</p></ng-template>`,
})
class TestTemplateHostComponent {
  @ViewChild('tpl', { static: true }) tpl!: TemplateRef<unknown>
}

describe('ModalRef closing', () => {
  let modal: Modal
  let appRef: ApplicationRef
  let overlayContainerElement: HTMLElement

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TheSeamModalModule],
      providers: [provideNoopAnimations()],
    })
    modal = TestBed.inject(Modal)
    appRef = TestBed.inject(ApplicationRef)
    overlayContainerElement =
      TestBed.inject(OverlayContainer).getContainerElement()
  })

  afterEach(fakeAsync(() => {
    modal.openDialogs.forEach((ref) => ref.close())
    settle()
  }))

  /** Runs change detection and lets the (noop) animation callbacks fire. */
  function settle() {
    appRef.tick()
    // OverlayScrollbars schedules a burst of timers on its first initialization.
    flush(200)
    appRef.tick()
  }

  function openComponent(config?: ModalConfig) {
    const ref = modal.openFromComponent(TestModalContentComponent, config)
    settle()
    return ref as ModalRef<TestModalContentComponent>
  }

  function openTemplate(config?: ModalConfig) {
    const host = TestBed.createComponent(TestTemplateHostComponent)
    host.detectChanges()
    const ref = modal.openFromTemplate(host.componentInstance.tpl, config)
    settle()
    return ref
  }

  function trackClosed(ref: ModalRef<any>) {
    const closed: { result: unknown }[] = []
    ref.afterClosed().subscribe((result) => closed.push({ result }))
    return closed
  }

  function pressEscape() {
    const event = new KeyboardEvent('keydown', { bubbles: true })
    Object.defineProperty(event, 'keyCode', { get: () => ESCAPE })
    document.body.dispatchEvent(event)
    settle()
  }

  function clickOutside(ref: ModalRef<any>) {
    const pane = ref._overlayRef.overlayElement
    pane.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    pane.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }))
    settle()
  }

  function clickButton(id: string) {
    const btn = overlayContainerElement.querySelector(
      `#${id}`,
    ) as HTMLButtonElement
    btn.click()
    settle()
  }

  describe('existing behavior', () => {
    it('closes on Escape', fakeAsync(() => {
      const ref = openComponent()
      const closed = trackClosed(ref)
      pressEscape()
      expect(closed.length).toBe(1)
    }))

    it('closes on click outside', fakeAsync(() => {
      const ref = openComponent()
      const closed = trackClosed(ref)
      clickOutside(ref)
      expect(closed.length).toBe(1)
    }))

    it('closes from seamModalClose with its result', fakeAsync(() => {
      const ref = openComponent()
      const closed = trackClosed(ref)
      clickButton('test-close-btn')
      expect(closed).toEqual([{ result: 'from-button' }])
    }))

    it('opens seamModalNext after closing', fakeAsync(() => {
      const ref = openComponent()
      clickButton('test-next-btn')
      expect(modal.openDialogs.length).toBe(1)
      expect(modal.openDialogs[0]).not.toBe(ref)
      expect(modal.openDialogs[0].componentInstance).toBeInstanceOf(
        TestNextModalContentComponent,
      )
    }))

    it('disableClose blocks Escape for component modals', fakeAsync(() => {
      const ref = openComponent({ disableClose: true })
      const closed = trackClosed(ref)
      pressEscape()
      expect(closed.length).toBe(0)
    }))

    it('disableClose does not block seamModalClose', fakeAsync(() => {
      const ref = openComponent({ disableClose: true })
      const closed = trackClosed(ref)
      clickButton('test-close-btn')
      expect(closed.length).toBe(1)
    }))
  })

  describe('disableClose', () => {
    it('blocks Escape for template modals', fakeAsync(() => {
      const ref = openTemplate({ disableClose: true })
      const closed = trackClosed(ref)
      pressEscape()
      expect(closed.length).toBe(0)
    }))

    it('blocks click outside for template modals', fakeAsync(() => {
      const ref = openTemplate({ disableClose: true })
      const closed = trackClosed(ref)
      clickOutside(ref)
      expect(closed.length).toBe(0)
    }))

    it('is not reset by a document mouseup', fakeAsync(() => {
      const ref = openComponent({ disableClose: true })
      const closed = trackClosed(ref)
      document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }))
      settle()
      pressEscape()
      expect(closed.length).toBe(0)
    }))
  })

  describe('canClose', () => {
    it('blocks Escape when it returns false', fakeAsync(() => {
      const canClose = jest.fn(() => false)
      const ref = openComponent({ canClose })
      const closed = trackClosed(ref)
      pressEscape()
      expect(closed.length).toBe(0)
      expect(canClose).toHaveBeenCalledWith('escape', undefined)
    }))

    it('allows Escape when it returns true', fakeAsync(() => {
      const ref = openComponent({ canClose: () => true })
      const closed = trackClosed(ref)
      pressEscape()
      expect(closed.length).toBe(1)
    }))

    it('receives "backdrop" for a click outside', fakeAsync(() => {
      const canClose = jest.fn(() => false)
      const ref = openComponent({ canClose })
      const closed = trackClosed(ref)
      clickOutside(ref)
      expect(closed.length).toBe(0)
      expect(canClose).toHaveBeenCalledWith('backdrop', undefined)
    }))

    it('guards seamModalClose with the button result', fakeAsync(() => {
      const canClose = jest.fn(() => false)
      const ref = openComponent({ canClose })
      const closed = trackClosed(ref)
      clickButton('test-close-btn')
      expect(closed.length).toBe(0)
      expect(canClose).toHaveBeenCalledWith('close-directive', 'from-button')
    }))

    it('applies to template modals', fakeAsync(() => {
      const ref = openTemplate({ canClose: () => false })
      const closed = trackClosed(ref)
      pressEscape()
      expect(closed.length).toBe(0)
    }))

    it('can be set on the ModalRef by the content component', fakeAsync(() => {
      const ref = openComponent()
      const closed = trackClosed(ref)
      ref.componentInstance!.modalRef.canClose = () => false
      pressEscape()
      expect(closed.length).toBe(0)
    }))

    it('can be set by the content component in its constructor', fakeAsync(() => {
      const ref = modal.openFromComponent(TestGuardedModalContentComponent)
      settle()
      const closed = trackClosed(ref)
      pressEscape()
      expect(closed.length).toBe(0)
    }))

    it('is not consulted while disableClose blocks the reason', fakeAsync(() => {
      const canClose = jest.fn(() => true)
      const ref = openComponent({ disableClose: true, canClose })
      const closed = trackClosed(ref)
      pressEscape()
      expect(closed.length).toBe(0)
      expect(canClose).not.toHaveBeenCalled()
    }))

    it('waits for a Promise result', fakeAsync(() => {
      let resolve!: (value: boolean) => void
      const ref = openComponent({
        canClose: () =>
          new Promise<boolean>((_resolve) => (resolve = _resolve)),
      })
      const closed = trackClosed(ref)
      pressEscape()
      expect(closed.length).toBe(0)
      resolve(true)
      settle()
      expect(closed.length).toBe(1)
    }))

    it('uses the first value of an Observable result', fakeAsync(() => {
      const answer = new Subject<boolean>()
      const ref = openComponent({ canClose: () => answer })
      const closed = trackClosed(ref)
      pressEscape()
      expect(closed.length).toBe(0)
      answer.next(true)
      settle()
      expect(closed.length).toBe(1)
    }))

    it('ignores repeat requests while a guard is pending', fakeAsync(() => {
      let resolve!: (value: boolean) => void
      const canClose = jest.fn(
        () => new Promise<boolean>((_resolve) => (resolve = _resolve)),
      )
      const ref = openComponent({ canClose })
      pressEscape()
      pressEscape()
      expect(canClose).toHaveBeenCalledTimes(1)
      resolve(false)
      settle()
      pressEscape()
      expect(canClose).toHaveBeenCalledTimes(2)
      void ref
    }))

    it('rejects and keeps the modal open if the guard throws', fakeAsync(() => {
      const error = new Error('guard failed')
      let attempts = 0
      const ref = openComponent({
        canClose: () => (++attempts === 1 ? Promise.reject(error) : true),
      })
      const closed = trackClosed(ref)
      let rejection: unknown
      ref.requestClose('escape').catch((e) => (rejection = e))
      settle()
      expect(rejection).toBe(error)
      expect(closed.length).toBe(0)

      // The failed request does not leave the modal stuck as pending.
      ref.requestClose('escape')
      settle()
      expect(closed.length).toBe(1)
    }))

    it('does not open seamModalNext when the close is blocked', fakeAsync(() => {
      const ref = openComponent({ canClose: () => false })
      clickButton('test-next-btn')
      ref.close()
      settle()
      expect(modal.openDialogs.length).toBe(0)
    }))
  })

  describe('requestClose', () => {
    it('resolves true when the modal closes', fakeAsync(() => {
      const ref = openComponent()
      let outcome: boolean | undefined
      ref.requestClose('escape').then((v) => (outcome = v))
      settle()
      expect(outcome).toBe(true)
    }))

    it('resolves false when the guard blocks', fakeAsync(() => {
      const canClose: TheSeamModalCanCloseFn = () => false
      const ref = openComponent({ canClose })
      let outcome: boolean | undefined
      ref.requestClose('escape').then((v) => (outcome = v))
      settle()
      expect(outcome).toBe(false)
    }))
  })

  describe('close', () => {
    it('bypasses canClose', fakeAsync(() => {
      const canClose = jest.fn(() => false)
      const ref = openComponent({ canClose })
      const closed = trackClosed(ref)
      ref.close('forced')
      settle()
      expect(closed).toEqual([{ result: 'forced' }])
      expect(canClose).not.toHaveBeenCalled()
    }))

    it('keeps the first result when called twice', fakeAsync(() => {
      const ref = openComponent()
      const closed = trackClosed(ref)
      ref.close('first')
      ref.close('second')
      settle()
      expect(closed).toEqual([{ result: 'first' }])
    }))
  })
})

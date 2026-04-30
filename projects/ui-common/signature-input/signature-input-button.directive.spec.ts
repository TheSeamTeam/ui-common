import { Component } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { FormControl, ReactiveFormsModule } from '@angular/forms'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { Subject } from 'rxjs'

import { Modal } from '@theseam/ui-common/modal'

import {
  SignatureInputPanelResult,
  TheSeamSignatureInputButtonDirective,
} from '@theseam/ui-common/signature-input'

class FakeModalRef {
  private readonly _afterClosed = new Subject<
    SignatureInputPanelResult | undefined
  >()
  afterClosed() {
    return this._afterClosed.asObservable()
  }
  close(result?: SignatureInputPanelResult): void {
    this._afterClosed.next(result)
    this._afterClosed.complete()
  }
}

class FakeModal {
  lastRef: FakeModalRef | null = null
  openFromComponent(): FakeModalRef {
    this.lastRef = new FakeModalRef()
    return this.lastRef
  }
}

@Component({
  template: `
    <button seamSignatureInput [formControl]="control">Sign</button>
  `,
  imports: [ReactiveFormsModule, TheSeamSignatureInputButtonDirective],
})
class HostComponent {
  readonly control = new FormControl<string | null>(null)
}

describe('TheSeamSignatureInputButtonDirective', () => {
  let modal: FakeModal

  beforeEach(() => {
    modal = new FakeModal()
    TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, HostComponent],
      providers: [{ provide: Modal, useValue: modal }],
    })
  })

  interface SetupResult {
    fixture: ComponentFixture<HostComponent>
    host: HostComponent
    button: HTMLButtonElement
    directive: TheSeamSignatureInputButtonDirective
  }

  function setup(): SetupResult {
    const fixture = TestBed.createComponent(HostComponent)
    const host = fixture.componentInstance
    fixture.detectChanges()
    const button = fixture.nativeElement.querySelector(
      'button',
    ) as HTMLButtonElement
    const directive = fixture.debugElement.children[0].injector.get(
      TheSeamSignatureInputButtonDirective,
    )
    return { fixture, host, button, directive }
  }

  it('opens the signature panel on click', () => {
    const { button } = setup()
    button.click()
    expect(modal.lastRef).not.toBeNull()
  })

  it('writes the submitted value to the bound form control', () => {
    const { host, button } = setup()
    button.click()
    modal.lastRef!.close({
      type: 'submit',
      value: 'data:image/png;base64,AAA',
    })
    expect(host.control.value).toBe('data:image/png;base64,AAA')
  })

  it('does not change the form value when the modal is canceled', () => {
    const { host, button } = setup()
    host.control.setValue('previous')
    button.click()
    modal.lastRef!.close({ type: 'cancel' })
    expect(host.control.value).toBe('previous')
  })

  it('emits signed with the submitted value', () => {
    const { button, directive } = setup()
    const values: string[] = []
    directive.signed.subscribe((v) => values.push(v))

    button.click()
    modal.lastRef!.close({ type: 'submit', value: 'data:image/png;base64,BBB' })

    expect(values).toEqual(['data:image/png;base64,BBB'])
  })

  it('emits canceled when the modal closes without a submit', () => {
    const { button, directive } = setup()
    let cancelCount = 0
    directive.canceled.subscribe(() => cancelCount++)

    button.click()
    modal.lastRef!.close({ type: 'cancel' })

    expect(cancelCount).toBe(1)
  })

  it('reflects disabled state to the host element when not paired with seamButton', () => {
    const { host, button, fixture } = setup()
    host.control.disable()
    fixture.detectChanges()
    expect(button.hasAttribute('disabled')).toBe(true)

    host.control.enable()
    fixture.detectChanges()
    expect(button.hasAttribute('disabled')).toBe(false)
  })

  it('does not open the modal when disabled', () => {
    const { host, button } = setup()
    host.control.disable()
    button.click()
    expect(modal.lastRef).toBeNull()
  })
})

import { Component, ViewChild } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'

import {
  SignatureInputPanelResult,
  TheSeamSignatureInputPanelComponent,
} from '@theseam/ui-common/signature-input'
import { TheSeamSignatureInputPanelHarness } from '../testing/signature-input-panel.harness'

@Component({
  template: `
    <seam-signature-input-panel
      (result)="onResult($event)"
    ></seam-signature-input-panel>
  `,
  imports: [TheSeamSignatureInputPanelComponent],
})
class HostComponent {
  @ViewChild(TheSeamSignatureInputPanelComponent, { static: true })
  panel!: TheSeamSignatureInputPanelComponent

  results: SignatureInputPanelResult[] = []

  onResult(result: SignatureInputPanelResult) {
    this.results.push(result)
  }
}

// Skipping rendering tests to keep this close to other *.spec.ts files in the
// codebase: the panel's child components depend on DOM APIs (signature_pad's
// canvas, ngx-file-drop's drag machinery, webfontloader) that aren't reliable
// in JSDOM. Storybook play functions cover the rendered behavior.
describe('TheSeamSignatureInputPanelComponent', () => {
  const originalMatchMedia = window.matchMedia
  const originalGetContext = HTMLCanvasElement.prototype.getContext

  beforeEach(() => {
    // TheSeamLayoutService and CDK's BreakpointObserver call window.matchMedia,
    // which JSDOM doesn't implement. Support both the modern EventTarget API
    // (addEventListener) and the legacy MediaQueryList API (addListener),
    // since CDK's BreakpointObserver still uses the latter.
    window.matchMedia = jest.fn().mockReturnValue({
      matches: false,
      media: '',
      onchange: null,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      addListener: jest.fn(),
      removeListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }) as unknown as typeof window.matchMedia

    // JSDOM returns null for canvas 2d context, which breaks signature_pad's
    // initializer. A minimal mock is enough — these tests don't render
    // anything to the canvas.
    HTMLCanvasElement.prototype.getContext = jest.fn().mockReturnValue({
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 0,
      clearRect: jest.fn(),
      beginPath: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      stroke: jest.fn(),
      fill: jest.fn(),
      arc: jest.fn(),
      closePath: jest.fn(),
      fillRect: jest.fn(),
      save: jest.fn(),
      restore: jest.fn(),
      setTransform: jest.fn(),
      scale: jest.fn(),
      translate: jest.fn(),
      measureText: jest.fn().mockReturnValue({ width: 10 }),
      fillText: jest.fn(),
    }) as unknown as typeof HTMLCanvasElement.prototype.getContext

    TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, HostComponent],
    })
  })

  afterEach(() => {
    window.matchMedia = originalMatchMedia
    HTMLCanvasElement.prototype.getContext = originalGetContext
  })

  async function setup() {
    const fixture = TestBed.createComponent(HostComponent)
    const host = fixture.componentInstance
    fixture.detectChanges()
    const harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      TheSeamSignatureInputPanelHarness,
    )
    return { fixture, host, harness }
  }

  it('defaults submit to disabled with no value', async () => {
    const { harness } = await setup()
    expect(await harness.isSubmitDisabled()).toBe(true)
  })

  it('emits cancel when the cancel button is clicked', async () => {
    const { host, harness } = await setup()
    await harness.cancel()
    expect(host.results).toEqual([{ type: 'cancel' }])
  })

  it('emits submit with the active control value', async () => {
    const { fixture, host, harness } = await setup()
    host.panel._form.controls.pen.setValue('data:image/png;base64,AAA')
    fixture.detectChanges()
    await fixture.whenStable()
    fixture.detectChanges()

    expect(await harness.isSubmitDisabled()).toBe(false)
    await harness.submit()

    expect(host.results).toEqual([
      { type: 'submit', value: 'data:image/png;base64,AAA' },
    ])
  })

  it('ignores whitespace-only values for submit enablement', async () => {
    const { fixture, host, harness } = await setup()
    host.panel._form.controls.pen.setValue('   ')
    fixture.detectChanges()
    await fixture.whenStable()

    expect(await harness.isSubmitDisabled()).toBe(true)
  })

  it('tracks registered input items', async () => {
    const { host } = await setup()
    // The child pen component registers itself under 'pen' during
    // construction — use a distinct custom type so registration isn't blocked.
    const item = { clear: jest.fn() }
    expect(host.panel.registerInputItem('custom', item)).toBe(true)
    expect(host.panel.registerInputItem('custom', item)).toBe(false)
    expect(host.panel.unregisterInputItem('custom', item)).toBe(true)
    expect(host.panel.unregisterInputItem('custom', item)).toBe(false)
  })

  it('clear button delegates to the active registered item', async () => {
    const { host } = await setup()
    // Replace the pen child component's auto-registration with a spy so the
    // clear button's delegation target is observable without relying on the
    // real signature_pad canvas wiring.
    const penItem = { clear: jest.fn() }
    ;(
      host.panel as unknown as { _registeredInputItems: Map<string, unknown> }
    )._registeredInputItems.set('pen', penItem)

    const event = new Event('click')
    jest.spyOn(event, 'preventDefault')
    jest.spyOn(event, 'stopPropagation')
    ;(
      host.panel as unknown as { _onClearBtnClick: (e: Event) => void }
    )._onClearBtnClick(event)

    expect(penItem.clear).toHaveBeenCalled()
    expect(event.preventDefault).toHaveBeenCalled()
    expect(event.stopPropagation).toHaveBeenCalled()
  })
})

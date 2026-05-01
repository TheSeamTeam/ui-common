import { Component } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed'
import { FormControl, ReactiveFormsModule } from '@angular/forms'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'

import { TheSeamSignatureInputImgComponent } from '@theseam/ui-common/signature-input'
import { TheSeamSignatureInputImgHarness } from '../testing/signature-input-img.harness'

@Component({
  template: `
    <seam-signature-input-img
      [formControl]="control"
    ></seam-signature-input-img>
  `,
  imports: [ReactiveFormsModule, TheSeamSignatureInputImgComponent],
})
class HostComponent {
  readonly control = new FormControl<string | null>(null)
}

function makeFile(name: string, sizeBytes: number, type = 'image/png'): File {
  const blob = new Blob([new Uint8Array(sizeBytes)], { type })
  return new File([blob], name, { type })
}

function getFileControl(
  imgCmp: TheSeamSignatureInputImgComponent,
): FormControl<File | null> {
  // _fileControl is protected; reach in for testing without adding a
  // dedicated test-only accessor to the component's public surface.
  return (imgCmp as unknown as { _fileControl: FormControl<File | null> })
    ._fileControl
}

function getPreviewValue(
  imgCmp: TheSeamSignatureInputImgComponent,
): string | null {
  // Read the component's preview signal directly rather than asserting on the
  // DOM — jsdom's FileReader doesn't settle reliably enough for DOM assertions.
  return (
    imgCmp as unknown as { _previewDataUrl: () => string | null }
  )._previewDataUrl()
}

describe('TheSeamSignatureInputImgComponent', () => {
  const originalMatchMedia = window.matchMedia

  beforeEach(() => {
    // Some CDK utilities read window.matchMedia. JSDOM doesn't implement it;
    // the values returned here aren't meaningful to these tests.
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

    TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, HostComponent],
    })
  })

  afterEach(() => {
    window.matchMedia = originalMatchMedia
  })

  async function setup() {
    const fixture = TestBed.createComponent(HostComponent)
    fixture.detectChanges()
    const harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      TheSeamSignatureInputImgHarness,
    )
    const imgCmp = fixture.debugElement.children[0]
      .componentInstance as TheSeamSignatureInputImgComponent
    return { fixture, harness, imgCmp }
  }

  it('has no preview when the form value is null', async () => {
    const { imgCmp } = await setup()
    expect(getPreviewValue(imgCmp)).toBeNull()
  })

  it('shows the preview from an externally-written form value', async () => {
    const { fixture, imgCmp } = await setup()
    const host = fixture.componentInstance
    host.control.setValue('data:image/png;base64,AAA')
    fixture.detectChanges()

    expect(getPreviewValue(imgCmp)).toBe('data:image/png;base64,AAA')
  })

  it('reports size errors for files over the 2MB limit', async () => {
    const { fixture, harness, imgCmp } = await setup()
    getFileControl(imgCmp).setValue(makeFile('too-big.png', 3 * 1024 * 1024))
    fixture.detectChanges()
    await fixture.whenStable()
    fixture.detectChanges()

    expect(await harness.getSizeError()).toBe('File size has exceeded 2MB.')
    expect(getPreviewValue(imgCmp)).toBeNull()
  })

  it('accepts files at or below the 2MB limit', async () => {
    const { fixture, harness, imgCmp } = await setup()
    getFileControl(imgCmp).setValue(makeFile('ok.png', 1024))
    fixture.detectChanges()

    expect(await harness.getSizeError()).toBeNull()
    expect(getFileControl(imgCmp).valid).toBe(true)
    // The async FileReader -> preview path is covered by the Storybook
    // play functions; jsdom's FileReader doesn't settle reliably under
    // Angular's whenStable(), so we don't assert on preview rendering here.
  })

  it('clears the preview when clear() is called after an external write', async () => {
    const { imgCmp } = await setup()
    imgCmp.writeValue('data:image/png;base64,AAA')
    expect(getPreviewValue(imgCmp)).toBe('data:image/png;base64,AAA')

    imgCmp.clear()
    expect(getPreviewValue(imgCmp)).toBeNull()
  })
})

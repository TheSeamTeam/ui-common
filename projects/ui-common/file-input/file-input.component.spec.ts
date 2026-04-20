import { createHostFactory, SpectatorHost } from '@ngneat/spectator/jest'

import { TheSeamFileInputComponent } from './file-input.component'
import { SeamFileRejection } from './file-item.models'

describe('TheSeamFileInputComponent', () => {
  let spectator: SpectatorHost<TheSeamFileInputComponent>
  const createHost = createHostFactory({
    component: TheSeamFileInputComponent,
    imports: [TheSeamFileInputComponent],
  })

  it('renders an interactive zone with role="button" and tabindex=0', () => {
    spectator = createHost(`<seam-file-input></seam-file-input>`)
    const zone = spectator.query('.seam-file-input__zone') as HTMLElement
    expect(zone).toBeTruthy()
    expect(zone.getAttribute('role')).toBe('button')
    expect(zone.getAttribute('tabindex')).toBe('0')
  })

  it('sets tabindex=-1 when disabled', () => {
    spectator = createHost(
      `<seam-file-input [disabled]="true"></seam-file-input>`,
    )
    const zone = spectator.query('.seam-file-input__zone') as HTMLElement
    expect(zone.getAttribute('tabindex')).toBe('-1')
  })

  it('renders default prompt text and suffix', () => {
    spectator = createHost(`<seam-file-input></seam-file-input>`)
    const prompt = spectator.query('.seam-file-input__prompt')
    expect(prompt?.textContent).toContain('Choose a file')
    expect(prompt?.textContent).toContain('or drag it here')
  })

  it('renders custom prompt text and suffix', () => {
    spectator = createHost(
      `<seam-file-input
        promptText="Choose an image"
        promptSuffix="or drop it here"></seam-file-input>`,
    )
    const prompt = spectator.query('.seam-file-input__prompt')
    expect(prompt?.textContent).toContain('Choose an image')
    expect(prompt?.textContent).toContain('or drop it here')
  })

  it('renders a hidden native file input with accept and multiple attributes', () => {
    spectator = createHost(
      `<seam-file-input [multiple]="true" accept="image/*"></seam-file-input>`,
    )
    const native = spectator.query('input[type="file"]') as HTMLInputElement
    expect(native).toBeTruthy()
    expect(native.hasAttribute('hidden')).toBe(true)
    expect(native.multiple).toBe(true)
    expect(native.getAttribute('accept')).toBe('image/*')
  })

  it('clicking the zone triggers a click on the hidden native input', () => {
    spectator = createHost(`<seam-file-input></seam-file-input>`)
    const zone = spectator.query('.seam-file-input__zone') as HTMLElement
    const native = spectator.query('input[type="file"]') as HTMLInputElement
    const clickSpy = jest.spyOn(native, 'click')
    zone.click()
    expect(clickSpy).toHaveBeenCalled()
  })

  it('does not trigger the native input when disabled', () => {
    spectator = createHost(
      `<seam-file-input [disabled]="true"></seam-file-input>`,
    )
    const zone = spectator.query('.seam-file-input__zone') as HTMLElement
    const native = spectator.query('input[type="file"]') as HTMLInputElement
    const clickSpy = jest.spyOn(native, 'click')
    zone.click()
    expect(clickSpy).not.toHaveBeenCalled()
  })
})

describe('TheSeamFileInputComponent — native change + errors', () => {
  let spectator: SpectatorHost<TheSeamFileInputComponent>
  const createHost = createHostFactory({
    component: TheSeamFileInputComponent,
    imports: [TheSeamFileInputComponent],
  })

  function dispatchChange(input: HTMLInputElement, files: File[]) {
    const dt = new DataTransfer()
    for (const f of files) dt.items.add(f)
    Object.defineProperty(input, 'files', {
      value: dt.files,
      configurable: true,
    })
    input.dispatchEvent(new Event('change', { bubbles: true }))
  }

  it('emits filesAdded on native input change', () => {
    spectator = createHost(`<seam-file-input></seam-file-input>`)
    const added: File[][] = []
    spectator.component.filesAdded.subscribe((f) => added.push(f))

    const native = spectator.query('input[type="file"]') as HTMLInputElement
    const f = new File(['x'], 'x.txt')
    dispatchChange(native, [f])

    expect(added).toEqual([[f]])
  })

  it('applies accept/maxSize validation to picker selection', () => {
    spectator = createHost(
      `<seam-file-input accept="image/*" [maxSize]="4"></seam-file-input>`,
    )
    const added: File[][] = []
    const rejected: SeamFileRejection[][] = []
    spectator.component.filesAdded.subscribe((f) => added.push(f))
    spectator.component.rejected.subscribe((r) => rejected.push(r))

    const native = spectator.query('input[type="file"]') as HTMLInputElement
    const ok = new File(['a'], 'a.png', { type: 'image/png' })
    const tooBig = new File(['abcdef'], 'big.png', { type: 'image/png' })
    const wrongType = new File(['t'], 't.txt', { type: 'text/plain' })
    dispatchChange(native, [ok, tooBig, wrongType])

    expect(added).toEqual([[ok]])
    expect(rejected[0]).toEqual([
      { file: tooBig, reasons: ['size'] },
      { file: wrongType, reasons: ['type'] },
    ])
  })

  it('resets the native input value after change so re-selecting the same file fires again', () => {
    spectator = createHost(`<seam-file-input></seam-file-input>`)
    const native = spectator.query('input[type="file"]') as HTMLInputElement
    dispatchChange(native, [new File(['x'], 'x.txt')])
    expect(native.value).toBe('')
  })

  it('renders an error line when rejections occur and hideErrors is false', () => {
    spectator = createHost(
      `<seam-file-input accept="image/*"></seam-file-input>`,
    )
    const native = spectator.query('input[type="file"]') as HTMLInputElement
    dispatchChange(native, [new File(['t'], 't.txt', { type: 'text/plain' })])
    spectator.detectChanges()

    const err = spectator.query('.seam-file-input__errors')
    expect(err?.textContent).toContain('File type not accepted')
  })

  it('hides the error line when hideErrors is true', () => {
    spectator = createHost(
      `<seam-file-input accept="image/*" [hideErrors]="true"></seam-file-input>`,
    )
    const native = spectator.query('input[type="file"]') as HTMLInputElement
    dispatchChange(native, [new File(['t'], 't.txt', { type: 'text/plain' })])
    spectator.detectChanges()

    expect(spectator.query('.seam-file-input__errors')).toBeNull()
  })

  it('clears the error line on the next successful selection', () => {
    spectator = createHost(
      `<seam-file-input accept="image/*"></seam-file-input>`,
    )
    const native = spectator.query('input[type="file"]') as HTMLInputElement
    dispatchChange(native, [new File(['t'], 't.txt', { type: 'text/plain' })])
    spectator.detectChanges()
    expect(spectator.query('.seam-file-input__errors')).not.toBeNull()

    dispatchChange(native, [new File(['ok'], 'ok.png', { type: 'image/png' })])
    spectator.detectChanges()
    expect(spectator.query('.seam-file-input__errors')).toBeNull()
  })
})

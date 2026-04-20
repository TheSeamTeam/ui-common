import { createHostFactory, SpectatorHost } from '@ngneat/spectator/jest'

import { TheSeamFileInputComponent } from './file-input.component'

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

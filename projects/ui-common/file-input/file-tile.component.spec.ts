import { createHostFactory, SpectatorHost } from '@ngneat/spectator/jest'

import { TheSeamFileTileComponent } from './file-tile.component'
import { SeamFileItem } from './file-item.models'

const textItem: SeamFileItem = {
  name: 'report.pdf',
  size: 123456,
  type: 'application/pdf',
  source: { kind: 'file', file: new File(['x'], 'report.pdf') },
}

describe('TheSeamFileTileComponent — row variant', () => {
  let spectator: SpectatorHost<TheSeamFileTileComponent>
  const createHost = createHostFactory({
    component: TheSeamFileTileComponent,
    imports: [TheSeamFileTileComponent],
  })

  it('renders the item name', () => {
    spectator = createHost(`<seam-file-tile [item]="item"></seam-file-tile>`, {
      hostProps: { item: textItem },
    })
    expect(spectator.query('.seam-file-tile__name')?.textContent).toContain(
      'report.pdf',
    )
  })

  it('renders the meta line by default', () => {
    spectator = createHost(`<seam-file-tile [item]="item"></seam-file-tile>`, {
      hostProps: { item: textItem },
    })
    const meta = spectator.query('.seam-file-tile__meta')
    expect(meta?.textContent).toContain('application/pdf')
  })

  it('hides the meta line when showMeta is false', () => {
    spectator = createHost(
      `<seam-file-tile [item]="item" [showMeta]="false"></seam-file-tile>`,
      { hostProps: { item: textItem } },
    )
    expect(spectator.query('.seam-file-tile__meta')).toBeNull()
  })

  it('applies the row variant class by default', () => {
    spectator = createHost(`<seam-file-tile [item]="item"></seam-file-tile>`, {
      hostProps: { item: textItem },
    })
    expect(spectator.query('.seam-file-tile')).toHaveClass(
      'seam-file-tile--row',
    )
  })

  it('shows a remove button by default and emits `remove` when clicked', () => {
    spectator = createHost(`<seam-file-tile [item]="item"></seam-file-tile>`, {
      hostProps: { item: textItem },
    })
    const emitted: SeamFileItem[] = []
    spectator.component.remove.subscribe((i) => emitted.push(i))

    const btn = spectator.query('.seam-file-tile__remove') as HTMLElement
    expect(btn).toBeTruthy()
    btn.click()

    expect(emitted).toEqual([textItem])
  })

  it('does not render the remove button when removable is false', () => {
    spectator = createHost(
      `<seam-file-tile [item]="item" [removable]="false"></seam-file-tile>`,
      { hostProps: { item: textItem } },
    )
    expect(spectator.query('.seam-file-tile__remove')).toBeNull()
  })

  it('does not render the remove button when disabled', () => {
    spectator = createHost(
      `<seam-file-tile [item]="item" [disabled]="true"></seam-file-tile>`,
      { hostProps: { item: textItem } },
    )
    expect(spectator.query('.seam-file-tile__remove')).toBeNull()
  })
})

describe('TheSeamFileTileComponent — preview variant', () => {
  let spectator: SpectatorHost<TheSeamFileTileComponent>
  const createHost = createHostFactory({
    component: TheSeamFileTileComponent,
    imports: [TheSeamFileTileComponent],
  })

  const imgFile = new File(['i'], 'pic.png', { type: 'image/png' })
  const imgItem: SeamFileItem = {
    name: 'pic.png',
    size: 1234,
    type: 'image/png',
    source: { kind: 'file', file: imgFile },
  }

  const urlItem: SeamFileItem = {
    name: 'server.png',
    type: 'image/png',
    source: { kind: 'url', url: 'https://ex.com/server.png' },
  }

  it('applies preview variant class', () => {
    spectator = createHost(
      `<seam-file-tile [item]="item" variant="preview"></seam-file-tile>`,
      { hostProps: { item: imgItem } },
    )
    expect(spectator.query('.seam-file-tile')).toHaveClass(
      'seam-file-tile--preview',
    )
  })

  it('renders filename below thumbnail when showName is true', () => {
    spectator = createHost(
      `<seam-file-tile [item]="item" variant="preview"></seam-file-tile>`,
      { hostProps: { item: imgItem } },
    )
    expect(
      spectator.query('.seam-file-tile__preview-name')?.textContent,
    ).toContain('pic.png')
  })

  it('hides filename when showName is false', () => {
    spectator = createHost(
      `<seam-file-tile [item]="item" variant="preview" [showName]="false"></seam-file-tile>`,
      { hostProps: { item: imgItem } },
    )
    expect(spectator.query('.seam-file-tile__preview-name')).toBeNull()
  })

  it('uses the URL directly for url-sourced image items', () => {
    spectator = createHost(
      `<seam-file-tile [item]="item" variant="preview"></seam-file-tile>`,
      { hostProps: { item: urlItem } },
    )
    const img = spectator.query('img.seam-file-tile__thumb') as HTMLImageElement
    expect(img.src).toBe('https://ex.com/server.png')
  })

  it('creates and revokes an object URL for file-sourced image items', () => {
    const createSpy = jest
      .spyOn(URL, 'createObjectURL')
      .mockReturnValue('blob:mock')
    const revokeSpy = jest.spyOn(URL, 'revokeObjectURL').mockImplementation()

    spectator = createHost(
      `<seam-file-tile [item]="item" variant="preview"></seam-file-tile>`,
      { hostProps: { item: imgItem } },
    )

    expect(createSpy).toHaveBeenCalledWith(imgFile)
    const img = spectator.query('img.seam-file-tile__thumb') as HTMLImageElement
    expect(img.src).toContain('blob:mock')

    spectator.setHostInput('item', {
      name: 'other.png',
      type: 'image/png',
      source: { kind: 'url', url: 'https://ex.com/other.png' },
    })
    spectator.detectChanges()

    expect(revokeSpy).toHaveBeenCalledWith('blob:mock')

    createSpy.mockRestore()
    revokeSpy.mockRestore()
  })

  it('falls back to mime icon when no thumbnail is available', () => {
    const nonImg: SeamFileItem = {
      name: 'doc.pdf',
      type: 'application/pdf',
      source: { kind: 'file', file: new File(['x'], 'doc.pdf') },
    }
    spectator = createHost(
      `<seam-file-tile [item]="item" variant="preview"></seam-file-tile>`,
      { hostProps: { item: nonImg } },
    )
    expect(spectator.query('img.seam-file-tile__thumb')).toBeNull()
    expect(spectator.query('.seam-file-tile__visual seam-icon')).not.toBeNull()
  })
})

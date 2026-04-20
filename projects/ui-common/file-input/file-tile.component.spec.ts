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

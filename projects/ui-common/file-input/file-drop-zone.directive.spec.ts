import { createHostFactory, SpectatorHost } from '@ngneat/spectator/jest'

import { TheSeamFileDropZoneDirective } from './file-drop-zone.directive'
import { SeamFileRejection } from './file-item.models'

interface HostProps {
  accept: string
  maxSize: number | null
  maxFiles: number | null
  disabled: boolean
  dropped: File[] | null
  rejected: SeamFileRejection[] | null
  onDrop: (files: File[]) => void
  onReject: (rejections: SeamFileRejection[]) => void
}

function dragEvent(type: string, files: File[] = []): DragEvent {
  const dt = new DataTransfer()
  for (const f of files) dt.items.add(f)
  const evt = new DragEvent(type, { bubbles: true, cancelable: true })
  Object.defineProperty(evt, 'dataTransfer', { value: dt })
  return evt
}

// ---------------------------------------------------------------------------
// Shared test-fixture setup — reused by both describe blocks below.
// ---------------------------------------------------------------------------

let spectator: SpectatorHost<TheSeamFileDropZoneDirective>
const createHost = createHostFactory({
  component: TheSeamFileDropZoneDirective,
})

const getZone = () => spectator.element as HTMLElement

function setup(props: Partial<HostProps> = {}) {
  const accept = props.accept ?? ''
  const maxSize = props.maxSize ?? null
  const maxFiles = props.maxFiles ?? null
  const disabled = props.disabled ?? false

  let dropped: File[] | null = null
  let rejected: SeamFileRejection[] | null = null

  spectator = createHost(
    `<div
      [seamFileDropZone]
      [accept]="accept"
      [maxSize]="maxSize"
      [maxFiles]="maxFiles"
      [disabled]="disabled"
      (seamFileDrop)="onDrop($event)"
      (seamFileDropRejected)="onReject($event)"
      data-testid="zone">
      drop here
    </div>`,
    {
      hostProps: {
        accept,
        maxSize,
        maxFiles,
        disabled,
        onDrop: (files: File[]) => {
          dropped = files
        },
        onReject: (rejections: SeamFileRejection[]) => {
          rejected = rejections
        },
      },
    },
  )

  return {
    getDropped: () => dropped,
    getRejected: () => rejected,
  }
}

// ---------------------------------------------------------------------------

describe('TheSeamFileDropZoneDirective', () => {
  it('adds `seam-file-drop-zone--over` class during dragover', () => {
    setup()
    const zone = getZone()
    zone.dispatchEvent(dragEvent('dragenter'))
    spectator.detectChanges()
    expect(zone.classList.contains('seam-file-drop-zone--over')).toBe(true)
  })

  it('removes the class after dragleave returns the counter to zero', () => {
    setup()
    const zone = getZone()
    zone.dispatchEvent(dragEvent('dragenter'))
    zone.dispatchEvent(dragEvent('dragenter')) // nested child
    zone.dispatchEvent(dragEvent('dragleave'))
    spectator.detectChanges()
    expect(zone.classList.contains('seam-file-drop-zone--over')).toBe(true)
    zone.dispatchEvent(dragEvent('dragleave'))
    spectator.detectChanges()
    expect(zone.classList.contains('seam-file-drop-zone--over')).toBe(false)
  })

  it('calls preventDefault on dragover to keep the drop event firing', () => {
    setup()
    const zone = getZone()
    const evt = dragEvent('dragover')
    const prevent = jest.spyOn(evt, 'preventDefault')
    zone.dispatchEvent(evt)
    expect(prevent).toHaveBeenCalled()
  })

  it('removes the class on drop', () => {
    setup()
    const zone = getZone()
    zone.dispatchEvent(dragEvent('dragenter'))
    zone.dispatchEvent(dragEvent('drop', [new File(['x'], 'x.txt')]))
    expect(zone.classList.contains('seam-file-drop-zone--over')).toBe(false)
  })

  it('does not apply the over class when disabled', () => {
    setup({ disabled: true })
    const zone = getZone()
    zone.dispatchEvent(dragEvent('dragenter'))
    expect(zone.classList.contains('seam-file-drop-zone--over')).toBe(false)
  })
})

describe('TheSeamFileDropZoneDirective — drop validation', () => {
  it('emits seamFileDrop with dropped files when no validation is set', () => {
    const { getDropped, getRejected } = setup()
    const zone = getZone()
    const f1 = new File(['a'], 'a.txt', { type: 'text/plain' })
    const f2 = new File(['b'], 'b.txt', { type: 'text/plain' })
    zone.dispatchEvent(dragEvent('drop', [f1, f2]))
    expect(getDropped()).toEqual([f1, f2])
    expect(getRejected()).toBeNull()
  })

  it('rejects files with mismatched type when accept is set', () => {
    const { getDropped, getRejected } = setup({ accept: 'image/*' })
    const zone = getZone()
    const img = new File(['i'], 'i.png', { type: 'image/png' })
    const txt = new File(['t'], 't.txt', { type: 'text/plain' })
    zone.dispatchEvent(dragEvent('drop', [img, txt]))
    expect(getDropped()).toEqual([img])
    expect(getRejected()).toEqual([{ file: txt, reasons: ['type'] }])
  })

  it('matches accept against file extension when MIME is empty', () => {
    const { getDropped, getRejected } = setup({ accept: '.csv,.txt' })
    const zone = getZone()
    const csv = new File(['a,b'], 'data.csv', { type: '' })
    const bin = new File(['x'], 'thing.bin', { type: '' })
    zone.dispatchEvent(dragEvent('drop', [csv, bin]))
    expect(getDropped()).toEqual([csv])
    expect(getRejected()).toEqual([{ file: bin, reasons: ['type'] }])
  })

  it('rejects files exceeding maxSize', () => {
    const { getDropped, getRejected } = setup({ maxSize: 4 })
    const zone = getZone()
    const small = new File(['abcd'], 's.txt') // 4 bytes
    const big = new File(['abcdef'], 'b.txt') // 6 bytes
    zone.dispatchEvent(dragEvent('drop', [small, big]))
    expect(getDropped()).toEqual([small])
    expect(getRejected()).toEqual([{ file: big, reasons: ['size'] }])
  })

  it('rejects extra files past maxFiles', () => {
    const { getDropped, getRejected } = setup({ maxFiles: 1 })
    const zone = getZone()
    const a = new File(['a'], 'a.txt')
    const b = new File(['b'], 'b.txt')
    zone.dispatchEvent(dragEvent('drop', [a, b]))
    expect(getDropped()).toEqual([a])
    expect(getRejected()).toEqual([{ file: b, reasons: ['count'] }])
  })

  it('collects multiple reasons per file without short-circuiting', () => {
    const { getDropped, getRejected } = setup({ accept: 'image/*', maxSize: 2 })
    const zone = getZone()
    const bad = new File(['abcdef'], 'bad.txt', { type: 'text/plain' })
    zone.dispatchEvent(dragEvent('drop', [bad]))
    expect(getDropped()).toEqual([])
    expect(getRejected()).toEqual([{ file: bad, reasons: ['type', 'size'] }])
  })

  it('does not emit anything when disabled', () => {
    const { getDropped, getRejected } = setup({ disabled: true })
    const zone = getZone()
    zone.dispatchEvent(dragEvent('drop', [new File(['a'], 'a.txt')]))
    expect(getDropped()).toBeNull()
    expect(getRejected()).toBeNull()
  })
})

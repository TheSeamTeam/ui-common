import { validateFiles } from './file-input-validation'

describe('validateFiles', () => {
  const noLimits = { accept: '', maxSize: null, maxFiles: null }

  it('accepts all files when no limits are set', () => {
    const a = new File(['a'], 'a.txt')
    const b = new File(['b'], 'b.txt')
    const { accepted, rejected } = validateFiles([a, b], noLimits)
    expect(accepted).toEqual([a, b])
    expect(rejected).toEqual([])
  })

  it('matches mime wildcard in accept', () => {
    const img = new File(['i'], 'i.png', { type: 'image/png' })
    const txt = new File(['t'], 't.txt', { type: 'text/plain' })
    const { accepted, rejected } = validateFiles([img, txt], {
      ...noLimits,
      accept: 'image/*',
    })
    expect(accepted).toEqual([img])
    expect(rejected).toEqual([{ file: txt, reasons: ['type'] }])
  })

  it('matches exact mime in accept', () => {
    const pdf = new File(['p'], 'p.pdf', { type: 'application/pdf' })
    const txt = new File(['t'], 't.txt', { type: 'text/plain' })
    const { accepted } = validateFiles([pdf, txt], {
      ...noLimits,
      accept: 'application/pdf',
    })
    expect(accepted).toEqual([pdf])
  })

  it('reports type and size on one file when both fail', () => {
    const bad = new File(['abcdef'], 'bad.bin', { type: 'application/x-bin' })
    const { rejected } = validateFiles([bad], {
      accept: 'image/*',
      maxSize: 2,
      maxFiles: null,
    })
    expect(rejected).toEqual([{ file: bad, reasons: ['type', 'size'] }])
  })

  it('rejects overflow with reason count only (type/size checks short-circuit to count)', () => {
    const a = new File(['a'], 'a.txt')
    const b = new File(['b'], 'b.txt')
    const c = new File(['c'], 'c.txt')
    const { accepted, rejected } = validateFiles([a, b, c], {
      ...noLimits,
      maxFiles: 2,
    })
    expect(accepted).toEqual([a, b])
    expect(rejected).toEqual([{ file: c, reasons: ['count'] }])
  })
})

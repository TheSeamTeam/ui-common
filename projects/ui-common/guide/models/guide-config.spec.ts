import { THE_SEAM_GUIDE_DEFAULTS } from './guide-config'

describe('THE_SEAM_GUIDE_DEFAULTS', () => {
  it('uses the values agreed in the design spec', () => {
    expect(THE_SEAM_GUIDE_DEFAULTS).toEqual({
      dismissible: true,
      targetTimeout: 3000,
      onMissingTarget: 'skip',
      targetLostGrace: 1000,
      onTargetLost: 'elementless',
    })
  })
})

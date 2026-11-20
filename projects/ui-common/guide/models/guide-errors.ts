export class TheSeamGuideBusyError extends Error {
  constructor() {
    super(
      'TheSeamGuide: a non-dismissible guide is already active. Wait for' +
        ' `activeGuide()?.afterClosed$` before starting another guide.',
    )
    this.name = 'TheSeamGuideBusyError'
  }
}

export class TheSeamGuideTargetTimeoutError extends Error {
  constructor(public readonly targetName: string) {
    super(`TheSeamGuide: timed out waiting for target "${targetName}".`)
    this.name = 'TheSeamGuideTargetTimeoutError'
  }
}

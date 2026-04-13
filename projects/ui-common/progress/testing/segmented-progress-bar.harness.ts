import { ComponentHarness } from '@angular/cdk/testing'

/** Harness for a single cell inside `TheSeamSegmentedProgressBarComponent`. */
export class TheSeamSegmentedProgressBarCellHarness extends ComponentHarness {
  static hostSelector = 'seam-segmented-progress-bar-cell'

  /** The visual state of the cell, derived from its host classes. */
  async getState(): Promise<'default' | 'complete'> {
    const host = await this.host()
    if (await host.hasClass('bg-success')) {
      return 'complete'
    }
    return 'default'
  }

  async click(): Promise<void> {
    return (await this.host()).click()
  }
}

/** Harness for `TheSeamSegmentedProgressBarComponent`. */
export class TheSeamSegmentedProgressBarHarness extends ComponentHarness {
  static hostSelector = 'seam-segmented-progress-bar'

  private readonly _cells = this.locatorForAll(
    TheSeamSegmentedProgressBarCellHarness,
  )

  /** Gets harnesses for every rendered cell, in order. */
  async getCells(): Promise<TheSeamSegmentedProgressBarCellHarness[]> {
    return this._cells()
  }

  /** Clicks the cell at the given zero-based index. */
  async clickCell(index: number): Promise<void> {
    const cells = await this.getCells()
    if (index < 0 || index >= cells.length) {
      throw new Error(
        `TheSeamSegmentedProgressBarHarness.clickCell: index ${index} out of range (0..${cells.length - 1})`,
      )
    }
    await cells[index].click()
  }
}

import { ComponentHarness, TestElement } from '@angular/cdk/testing'

/**
 * Harness for `TheSeamStatesCountiesMapComponent`. Designed for use in both
 * TestBed and Storybook (via `@marklb/storybook-harness`).
 */
export class TheSeamStatesCountiesMapHarness extends ComponentHarness {
  static hostSelector = 'seam-states-counties-map'

  private readonly _wrapper = this.locatorFor('.states-counties-map-wrapper')
  private readonly _svg = this.locatorForOptional('svg')

  /** Whether the SVG has been rendered yet. */
  async hasRendered(): Promise<boolean> {
    return (await this._svg()) !== null
  }

  /** Returns all county path elements that have been rendered. */
  async getCountyPaths(): Promise<TestElement[]> {
    return this.locatorForAll('path[county-id]')()
  }

  /** Returns the path for a single county by its FIPS id, or null. */
  async getCountyPath(countyId: string): Promise<TestElement | null> {
    const matches = await this.locatorForAll(`path[county-id="${countyId}"]`)()
    return matches[0] ?? null
  }

  /** Ids of every county currently marked `county-selected`. */
  async getSelectedCountyIds(): Promise<string[]> {
    const paths = await this.locatorForAll('path.county-selected')()
    const ids = await Promise.all(paths.map((p) => p.getAttribute('county-id')))
    return ids.filter((id): id is string => id !== null)
  }

  /** Click a county by FIPS id. Throws if the county is not rendered. */
  async clickCounty(countyId: string): Promise<void> {
    const path = await this.getCountyPath(countyId)
    if (!path) {
      throw new Error(
        `TheSeamStatesCountiesMapHarness.clickCounty: county ${countyId} is not rendered`,
      )
    }
    await path.click()
  }

  /** Hover a county by FIPS id. Throws if the county is not rendered. */
  async hoverCounty(countyId: string): Promise<void> {
    const path = await this.getCountyPath(countyId)
    if (!path) {
      throw new Error(
        `TheSeamStatesCountiesMapHarness.hoverCounty: county ${countyId} is not rendered`,
      )
    }
    await path.hover()
  }

  /** Rendered viewport dimensions, for layout-sensitive assertions. */
  async getWrapperSize(): Promise<{ width: number; height: number }> {
    const rect = await (await this._wrapper()).getDimensions()
    return { width: rect.width, height: rect.height }
  }
}

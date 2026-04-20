import { ComponentHarness } from '@angular/cdk/testing'
import { SeamFileTileVariant } from '../file-item.models'

/**
 * Test harness for `<seam-file-tile>`.
 */
export class TheSeamFileTileHarness extends ComponentHarness {
  static hostSelector = 'seam-file-tile'

  private _root = this.locatorFor('.seam-file-tile')
  private _rowName = this.locatorForOptional('.seam-file-tile__name')
  private _previewName = this.locatorForOptional(
    '.seam-file-tile__preview-name',
  )
  private _remove = this.locatorForOptional('.seam-file-tile__remove')
  private _clickableBody = this.locatorForOptional(
    '.seam-file-tile__clickable-body',
  )

  async getName(): Promise<string> {
    const rowName = await this._rowName()
    if (rowName) return (await rowName.text()).trim()
    const previewName = await this._previewName()
    if (previewName) return (await previewName.text()).trim()
    return ''
  }

  async getVariant(): Promise<SeamFileTileVariant> {
    const root = await this._root()
    const cls = (await root.getAttribute('class')) ?? ''
    return cls.includes('seam-file-tile--preview') ? 'preview' : 'row'
  }

  /** True when a consumer has wired `(itemClick)` AND the tile isn't disabled. */
  async isClickable(): Promise<boolean> {
    return (await this._clickableBody()) !== null
  }

  async click(): Promise<void> {
    const clickable = await this._clickableBody()
    if (!clickable) {
      throw new Error(
        'TheSeamFileTileHarness.click: tile is not clickable (no (itemClick) subscriber or disabled)',
      )
    }
    await clickable.click()
  }

  async clickRemove(): Promise<void> {
    const btn = await this._remove()
    if (!btn) {
      throw new Error(
        'TheSeamFileTileHarness.clickRemove: remove button is not present (non-removable or disabled)',
      )
    }
    await btn.click()
  }
}

import { ComponentHarness } from '@angular/cdk/testing'

import { TheSeamFileInputHarness } from './file-input.harness'
import { TheSeamFileTileHarness } from './file-tile.harness'

/**
 * Test harness for `<seam-file-field>`. Delegates to tile/input harnesses
 * for their respective pieces.
 */
export class TheSeamFileFieldHarness extends ComponentHarness {
  static hostSelector = 'seam-file-field'

  private _replace = this.locatorForOptional('.seam-file-field__replace')
  private _allInputs = this.locatorForAll(TheSeamFileInputHarness)
  private _tiles = this.locatorForAll(TheSeamFileTileHarness)

  /**
   * Returns the visible embedded file-input harness, or null when the field
   * is in the filled single-mode state (visible input replaced by tile).
   * In filled single-mode the hidden input still exists but is not returned.
   */
  async getInputHarness(): Promise<TheSeamFileInputHarness | null> {
    const all = await this._allInputs()
    for (const h of all) {
      const host = await h.host()
      if ((await host.getAttribute('hidden')) === null) {
        return h
      }
    }
    return null
  }

  async getTiles(): Promise<TheSeamFileTileHarness[]> {
    return this._tiles()
  }

  async getReplaceButtonText(): Promise<string | null> {
    const btn = await this._replace()
    if (!btn) return null
    return (await btn.text()).trim()
  }

  async clickReplace(): Promise<void> {
    const btn = await this._replace()
    if (!btn) {
      throw new Error(
        'TheSeamFileFieldHarness.clickReplace: replace button is not present (field is empty or in multi mode)',
      )
    }
    await btn.click()
  }
}

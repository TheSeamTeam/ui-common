import { ComponentHarness } from '@angular/cdk/testing'
import { dataTransferFromFiles } from './_harness-utils'

/**
 * Test harness for `<seam-file-input>`.
 */
export class TheSeamFileInputHarness extends ComponentHarness {
  static hostSelector = 'seam-file-input'

  private _zone = this.locatorFor('.seam-file-input__zone')
  private _prompt = this.locatorFor('.seam-file-input__prompt')
  private _errors = this.locatorForOptional('.seam-file-input__errors')
  private _native = this.locatorFor('input[type="file"]')

  /** Trimmed prompt text including the bold portion and suffix. */
  async getPromptText(): Promise<string> {
    return (await (await this._prompt()).text()).trim()
  }

  /** Component renders `tabindex=-1` on the zone when disabled. */
  async isDisabled(): Promise<boolean> {
    const zone = await this._zone()
    return (await zone.getAttribute('tabindex')) === '-1'
  }

  /** Trimmed error line text, or null when no errors are visible. */
  async getErrorMessage(): Promise<string | null> {
    const el = await this._errors()
    if (!el) return null
    return (await el.text()).trim()
  }

  /**
   * Simulates drop of files on the zone. The directive performs validation
   * and emits `filesAdded` / `rejected` via the component.
   */
  async dropFiles(files: File[]): Promise<void> {
    const zone = await this._zone()
    await zone.dispatchEvent('drop', {
      dataTransfer: dataTransferFromFiles(files),
    })
  }
}

import { ComponentHarness } from '@angular/cdk/testing'

export class TheSeamSignatureInputTextHarness extends ComponentHarness {
  static hostSelector = 'seam-signature-input-text'

  private readonly _input = this.locatorFor('input')
  private readonly _canvas = this.locatorFor('canvas')

  async getInput() {
    return this._input()
  }

  async enterName(text: string): Promise<void> {
    const input = await this._input()
    await input.clear()
    await input.sendKeys(text)
  }

  async getInputValue(): Promise<string> {
    const input = await this._input()
    return input.getProperty<string>('value')
  }

  async isInputDisabled(): Promise<boolean> {
    const input = await this._input()
    return (await input.getAttribute('disabled')) !== null
  }

  async getCanvas() {
    return this._canvas()
  }
}

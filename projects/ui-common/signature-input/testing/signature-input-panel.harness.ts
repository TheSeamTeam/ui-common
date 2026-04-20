import { ComponentHarness, TestElement } from '@angular/cdk/testing'

import { SignatureInputType } from '../signature-input-panel.models'
import { TheSeamSignatureInputImgHarness } from './signature-input-img.harness'
import { TheSeamSignatureInputPenHarness } from './signature-input-pen.harness'
import { TheSeamSignatureInputTextHarness } from './signature-input-text.harness'

export class TheSeamSignatureInputPanelHarness extends ComponentHarness {
  static hostSelector = 'seam-signature-input-panel'

  private readonly _drawBtn = this.locatorFor('button:nth-of-type(1)')
  private readonly _typeBtn = this.locatorFor('button:nth-of-type(2)')
  private readonly _uploadBtn = this.locatorFor('button:nth-of-type(3)')

  private readonly _footerBtns = this.locatorForAll(
    '.seam-signature-input-panel__footer button',
  )

  private readonly _penHarness = this.locatorForOptional(
    TheSeamSignatureInputPenHarness,
  )
  private readonly _textHarness = this.locatorForOptional(
    TheSeamSignatureInputTextHarness,
  )
  private readonly _imgHarness = this.locatorForOptional(
    TheSeamSignatureInputImgHarness,
  )

  async showType(type: SignatureInputType): Promise<void> {
    const btn =
      type === 'pen'
        ? await this._drawBtn()
        : type === 'text'
          ? await this._typeBtn()
          : await this._uploadBtn()
    await btn.click()
  }

  async getActiveType(): Promise<SignatureInputType | null> {
    if (await this._penHarness()) return 'pen'
    if (await this._textHarness()) return 'text'
    if (await this._imgHarness()) return 'img'
    return null
  }

  async getPen(): Promise<TheSeamSignatureInputPenHarness | null> {
    return this._penHarness()
  }

  async getText(): Promise<TheSeamSignatureInputTextHarness | null> {
    return this._textHarness()
  }

  async getImg(): Promise<TheSeamSignatureInputImgHarness | null> {
    return this._imgHarness()
  }

  async getClearOrDeleteButton(): Promise<TestElement> {
    const [btn] = await this._footerBtns()
    return btn
  }

  async getCancelButton(): Promise<TestElement> {
    const buttons = await this._footerBtns()
    return buttons[buttons.length - 2]
  }

  async getSubmitButton(): Promise<TestElement> {
    const buttons = await this._footerBtns()
    return buttons[buttons.length - 1]
  }

  async isSubmitDisabled(): Promise<boolean> {
    const btn = await this.getSubmitButton()
    return (await btn.getAttribute('disabled')) !== null
  }

  async cancel(): Promise<void> {
    const btn = await this.getCancelButton()
    await btn.click()
  }

  async submit(): Promise<void> {
    const btn = await this.getSubmitButton()
    await btn.click()
  }
}

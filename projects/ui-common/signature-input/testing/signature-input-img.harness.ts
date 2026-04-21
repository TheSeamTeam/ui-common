import { ComponentHarness } from '@angular/cdk/testing'

export class TheSeamSignatureInputImgHarness extends ComponentHarness {
  static hostSelector = 'seam-signature-input-img'

  private readonly _fileDrop = this.locatorFor(
    '.seam-signature-input-img__upload-box',
  )
  private readonly _sizeError = this.locatorForOptional(
    '.seam-signature-input-img__size-error',
  )
  private readonly _preview = this.locatorForOptional(
    '.seam-signature-input-img__preview',
  )

  async getSizeError(): Promise<string | null> {
    const el = await this._sizeError()
    return el ? (await el.text()).trim() : null
  }

  async hasPreview(): Promise<boolean> {
    return (await this._preview()) !== null
  }

  async getPreviewSrc(): Promise<string | null> {
    const el = await this._preview()
    return el ? el.getAttribute('src') : null
  }

  async getFileDrop() {
    return this._fileDrop()
  }
}

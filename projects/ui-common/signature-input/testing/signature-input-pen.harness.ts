import { ComponentHarness } from '@angular/cdk/testing'

export class TheSeamSignatureInputPenHarness extends ComponentHarness {
  static hostSelector = 'seam-signature-input-pen'

  private readonly _canvas = this.locatorFor('canvas')

  async getCanvas() {
    return this._canvas()
  }

  async getCanvasWidth(): Promise<number | null> {
    const canvas = await this._canvas()
    const attr = await canvas.getAttribute('width')
    return attr ? Number(attr) : null
  }

  async getCanvasHeight(): Promise<number | null> {
    const canvas = await this._canvas()
    const attr = await canvas.getAttribute('height')
    return attr ? Number(attr) : null
  }
}

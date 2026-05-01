import { ComponentHarness } from '@angular/cdk/testing'
import { dataTransferFromFiles } from './_harness-utils'

/**
 * Test harness for an element with `[seamFileDropZone]` attached.
 *
 * Usage:
 * ```ts
 * const harness = await loader.getHarness(TheSeamFileDropZoneHarness)
 * await harness.dropFiles([new File(['x'], 'x.txt')])
 * expect(await harness.isOver()).toBe(false)
 * ```
 */
export class TheSeamFileDropZoneHarness extends ComponentHarness {
  static hostSelector = '[seamFileDropZone]'

  async isOver(): Promise<boolean> {
    const host = await this.host()
    return ((await host.getAttribute('class')) ?? '').includes(
      'seam-file-drop-zone--over',
    )
  }

  async dropFiles(files: File[]): Promise<void> {
    const host = await this.host()
    await host.dispatchEvent('drop', {
      dataTransfer: dataTransferFromFiles(files),
    })
  }
}

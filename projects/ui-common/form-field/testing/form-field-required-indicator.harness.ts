import { ComponentHarness } from '@angular/cdk/testing'

export class TheSeamFormFieldRequiredIndicatorHarness extends ComponentHarness {
  static hostSelector = 'seam-form-field-required-indicator'

  public async isIndicatorVisible() {
    return (await (await this.host()).text()) === '*'
  }
}

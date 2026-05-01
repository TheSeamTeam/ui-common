import {
  BaseHarnessFilters,
  ComponentHarness,
  HarnessPredicate,
} from '@angular/cdk/testing'

export interface SignatureInputButtonHarnessFilters extends BaseHarnessFilters {
  text?: string | RegExp
}

export class TheSeamSignatureInputButtonHarness extends ComponentHarness {
  static hostSelector = 'button[seamSignatureInput], a[seamSignatureInput]'

  static with(
    options: SignatureInputButtonHarnessFilters = {},
  ): HarnessPredicate<TheSeamSignatureInputButtonHarness> {
    return new HarnessPredicate(
      TheSeamSignatureInputButtonHarness,
      options,
    ).addOption('text', options.text, (harness, text) =>
      HarnessPredicate.stringMatches(harness.getText(), text),
    )
  }

  async getText(): Promise<string> {
    return (await this.host()).text()
  }

  async isDisabled(): Promise<boolean> {
    return (await this.host()).getAttribute('disabled').then((v) => v !== null)
  }

  async click(): Promise<void> {
    await (await this.host()).click()
  }
}

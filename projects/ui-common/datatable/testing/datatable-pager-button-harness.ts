import { BaseHarnessFilters, ComponentHarness, HarnessPredicate } from '@angular/cdk/testing'

interface TheSeamDatatablePagerButtonHarnessFilters extends BaseHarnessFilters {
  /** Filters based on the page number of the button. */
  pageNumber?: number | string | RegExp | null
}

export class TheSeamDatatablePagerButtonHarness extends ComponentHarness {
  static hostSelector = '.pager .pages'

  /** Creates a `HarnessPredicate` used to locate a particular `MyMenuHarness`. */
  static with(options: TheSeamDatatablePagerButtonHarnessFilters): HarnessPredicate<TheSeamDatatablePagerButtonHarness> {
    return new HarnessPredicate(TheSeamDatatablePagerButtonHarness, options)
        .addOption('page number', options.pageNumber,
            (harness, index) => HarnessPredicate.stringMatches(harness.getLabel(), `page ${index}`))
  }

  public async getLabel(): Promise<string | null> {
    return (await this.host()).getAttribute('aria-label')
  }

  public async getAnchor() {
    return this.locatorFor('a')()
  }
}

import { coerceBooleanProperty } from '@angular/cdk/coercion'
import { BaseHarnessFilters, ComponentHarness, HarnessPredicate } from '@angular/cdk/testing'
import { TheSeamTiledSelectHarness } from '@theseam/ui-common/tiled-select'

interface TheSeamSchemaFormTiledSelectHarnessFilters extends BaseHarnessFilters {
  /** Filters based on the name of the field. */
  name?: string | RegExp
}

export class TheSeamSchemaFormTiledSelectHarness extends ComponentHarness {
  static hostSelector = 'seam-schema-form-tiled-select'

  private readonly _tiledSelect = this.locatorFor(TheSeamTiledSelectHarness)

  /** Creates a `HarnessPredicate` used to locate a particular `TheSeamSchemaFormTiledSelectHarness`. */
  static with(options: TheSeamSchemaFormTiledSelectHarnessFilters): HarnessPredicate<TheSeamSchemaFormTiledSelectHarness> {
    return new HarnessPredicate(TheSeamSchemaFormTiledSelectHarness, options)
        .addOption('field name', options.name,
            (harness, name) => HarnessPredicate.stringMatches(harness.getName(), name))
  }

  public async getName(): Promise<string | null> {
    return (await (await this._tiledSelect()).host()).getAttribute('name')
  }

  public async getValue(): Promise<any> {
    return (await this._tiledSelect()).getValue()
  }

  public async isDisabled(): Promise<boolean> {
    return (await (await this._tiledSelect()).host()).getProperty('disabled')
  }

  public async isRequired(): Promise<boolean> {
    const required = await (await (await this._tiledSelect()).host()).getAttribute('required')
    return coerceBooleanProperty(required)
  }

  public async getTiles() {
    return (await this._tiledSelect()).getTiles()
  }

  public async getTileAtIndex(index: number) {
    return (await this._tiledSelect()).getTileAtIndex(index)
  }

  public async getTileByName(name: string) {
    return (await this._tiledSelect()).getTileByName(name)
  }
}

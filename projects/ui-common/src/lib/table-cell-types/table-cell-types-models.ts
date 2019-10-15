import { ComponentType } from '@angular/cdk/portal'

import { ITableCellData } from '../table/index'

export interface ITableCellTypeManifest {
  /**
   * Name used to reference the cell type. Must be unique to avoid incorrect cell selection.
   */
  name: string
  /**
   * The cell type component.
   *
   * TODO: Add support for lazy loaded cells. This isn't important yet, but
   * later on we may have many unused cell types or a large cell type that isn't
   * used often.
   */
  component: ComponentType<{}> /* | string */ // TODO: Add string for lazy loaded cell support.
}

export interface ICalucatedValueContext<R = any, V = any>
  // TODO: When context usage is better known the Partial should be removed and
  // to clearly define expected values in context.
  extends Partial<ITableCellData<R, V>> {
  [key: string]: any
}

export type CalculatedValueContextFn = () => ICalucatedValueContext

export type CaluclatedValueContextType = ICalucatedValueContext | CalculatedValueContextFn

import { DynamicValue } from '../../dynamic/index'
import { TheSeamIconType } from '../../icon/index'

import { DynamicDatatableCellActionLink, DynamicDatatableCellActionModal } from './cell-action'
import { IDynamicDatatableCellType } from './cell-type'

// tslint:disable:no-inferrable-types

export class DynamicDatatableCellTypeConfig<T = IDynamicDatatableCellType> {
  type: T

  /**
   * Styles added to the root cell elements `style` attribute.
   */
  styles?: string | string[]

  /**
   * Classes added to the root cell elements `class` attribute.
   */
  cssClass?: string | string[]
}

export class DynamicDatatableCellTypeConfigString extends DynamicDatatableCellTypeConfig<'string'> {
  action?: DynamicDatatableCellTypeConfigIconAction

  /**
   * TODO: Implement
   */
  // truncate?: boolean = false
}

export class DynamicDatatableCellTypeConfigInteger extends DynamicDatatableCellTypeConfig<'integer'> {

}

export class DynamicDatatableCellTypeConfigDecimal extends DynamicDatatableCellTypeConfig<'decimal'> {

}

export class DynamicDatatableCellTypeConfigDate extends DynamicDatatableCellTypeConfig<'date'> {
  format?: string = 'MM-dd-yyyy h:mm aaa'
}

export type DynamicDatatableCellTypeConfigIconAction = DynamicDatatableCellActionLink | DynamicDatatableCellActionModal

export class DynamicDatatableCellTypeConfigIcon extends DynamicDatatableCellTypeConfig<'icon'> {
  /**
   * TODO: Consider different trigger types, such as, click, dbclick, hover, etc
   */
  action?: DynamicDatatableCellTypeConfigIconAction

  /**
   * Element title attribute.
   */
  titleAttr?: DynamicValue<string>

  /**
   * Screen-reader text.
   */
  srOnly?: DynamicValue<string>

  /**
   * Css class added to the link element.
   */
  linkClass?: DynamicValue<string>

  /**
   * seam-icon `iconClass` input.
   */
  iconClass?: DynamicValue<string>

  /**
   * Can apply pre-defined icon styles.
   */
  iconType?: TheSeamIconType
}

// export class DynamicDatatableCellTypeConfigUrl extends DynamicDatatableCellTypeConfig<'url'> {

// }

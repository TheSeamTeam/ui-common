import { TheSeamIconType } from '../../icon/index'

import { DynamicDatatableCellActionLink, DynamicDatatableCellActionModal } from './cell-action'
import { IDynamicDatatableCellType } from './cell-type'
import { IJexlExprDef } from './jexl-expr-def'

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
  action?: DynamicDatatableCellTypeConfigIconAction

  /**
   * Element title attribute.
   */
  titleAttr?: string | IJexlExprDef

  /**
   * Screen-reader text.
   */
  srOnly?: string | IJexlExprDef

  /**
   * Css class added to the link element.
   */
  linkClass?: string | IJexlExprDef

  /**
   * seam-icon `iconClass` input.
   */
  iconClass?: string | IJexlExprDef

  /**
   * Can apply pre-defined icon styles.
   */
  iconType?: TheSeamIconType
}

// export class DynamicDatatableCellTypeConfigUrl extends DynamicDatatableCellTypeConfig<'url'> {

// }

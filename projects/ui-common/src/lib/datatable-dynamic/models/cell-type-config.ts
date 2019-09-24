import { IDynamicDatatableCellType } from './cell-type'

// tslint:disable:no-inferrable-types

export class DynamicDatatableCellTypeConfigBase<T = IDynamicDatatableCellType> {
  type: T

  /**
   * Styles added to the root cell elements `style` attribute.
   */
  styles?: 'string' | 'string'[]

  /**
   * Classes added to the root cell elements `class` attribute.
   */
  cssClass?: 'string' | 'string'[]
}

export class DynamicDatatableCellTypeConfigString extends DynamicDatatableCellTypeConfigBase<'string'> {
  // truncate?: boolean = false
}

export class DynamicDatatableCellTypeConfigInteger extends DynamicDatatableCellTypeConfigBase<'integer'> {

}

export class DynamicDatatableCellTypeConfigDecimal extends DynamicDatatableCellTypeConfigBase<'decimal'> {

}

export class DynamicDatatableCellTypeConfigDate extends DynamicDatatableCellTypeConfigBase<'date'> {
  format?: string = 'MM-dd-yyyy h:mm aaa'
}

// export class DynamicDatatableCellTypeConfigIcon extends DynamicDatatableCellTypeConfigBase<'icon'> {

// }

// export class DynamicDatatableCellTypeConfigUrl extends DynamicDatatableCellTypeConfigBase<'url'> {

// }

import { DynamicActionDefType, DynamicActionDefTypeName } from './dynamic-action-def-type'

export interface IDynamicActionDef<T = DynamicActionDefTypeName> {

  readonly type: T

  // TODO: Fix model to avoid this.
  [key: string]: any
}

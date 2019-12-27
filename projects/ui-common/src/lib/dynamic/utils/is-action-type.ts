import { IDynamicActionDef } from '../models/dynamic-action-def'
import { DynamicActionDefType, DynamicActionDefTypeName } from '../models/dynamic-action-def-type'

export function isActionType<T = DynamicActionDefTypeName>(
  action: IDynamicActionDef,
  typeName: DynamicActionDefTypeName
): action is DynamicActionDefType<T> {
  return action.type === typeName
}

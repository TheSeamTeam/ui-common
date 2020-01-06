import { IDynamicActionDef } from '../models/dynamic-action-def'

export function isActionType<T extends string>(
  action: IDynamicActionDef<T>,
  typeName: T
): action is IDynamicActionDef<T> {
  return action.type === typeName
}

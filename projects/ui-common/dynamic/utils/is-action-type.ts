import { DynamicActionDef } from '../models/dynamic-action-def'

export function isActionType<T extends string>(
  action: DynamicActionDef<T>,
  typeName: T
): action is DynamicActionDef<T> {
  return action.type === typeName
}

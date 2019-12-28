import { IDynamicActionDef } from './dynamic-action-def'
import { DynamicActionDefTypeName } from './dynamic-action-def-type'
import { IDynamicActionUiDef } from './dynamic-action-ui-def'
import { DynamicValue } from './dynamic-value'

export interface IDynamicAction<T = DynamicActionDefTypeName, D = any, R = any> {

  readonly type: T

  // TODO: Is this neccessary? It is basically just a default lavel for the
  // action. I figured it may be good to at least have a default for thinks like
  // ARIA attributes, but it may be better to just require the action def to
  // decide if a label is necessary.
  label: DynamicValue<string>

  // TODO: Consider allowing Observable return. Currently actions are executed
  // and expected to complete, so Promise is enough. Observables could possibly
  // be used to emit multiple outputs, such as progress, with the expectation
  // that it would eventually complete.
  exec?: (args: IDynamicActionDef<T>, context: D) => Promise<R>

  execSync?: (args: IDynamicActionDef<T>, context: D) => R

  getUiProps?: (args: IDynamicActionDef<T>, context: D) => Promise<IDynamicActionUiDef<T>>

}

export interface IDynamicActionDef<T = string> {

  type: T

  // TODO: Fix model to avoid this.
  [key: string]: any
}

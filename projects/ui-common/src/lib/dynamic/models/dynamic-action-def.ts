// TODO: Add something to the model that clarifies what is supported from JSON or javascript only.
export interface IDynamicActionDef<T extends string> {

  readonly type: T

  // TODO: Fix model to avoid this.
  [key: string]: any
}

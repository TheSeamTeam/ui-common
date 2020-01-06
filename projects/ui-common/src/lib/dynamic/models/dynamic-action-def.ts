export interface IDynamicActionDef<T extends string> {

  readonly type: T

  // TODO: Fix model to avoid this.
  [key: string]: any
}

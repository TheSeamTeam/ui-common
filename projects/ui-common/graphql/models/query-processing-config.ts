export const DEFAULT_TO_REMOVE_ON_UNDEFINED = ['where', 'order']

export interface QueryProcessingVariablesConfig {
  removeIfNotDefined?: string[]
  removeIfNotUsed?: string[]
  inline?: string[]
  /**
   * If set, the order variable (expected to be an array of sort objects) will be
   * checked and if this field name is not already present as a sort key, it will
   * be appended with a default direction of DESC. This ensures deterministic
   * ordering for paginated results.
   */
  orderTiebreaker?: string
}

export interface QueryProcessingConfig {
  variables: QueryProcessingVariablesConfig

  /**
   * If skip and take are found, they will be removed
   */
  disablePaging?: boolean
}

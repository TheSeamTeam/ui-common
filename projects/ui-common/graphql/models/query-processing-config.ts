export const DEFAULT_TO_REMOVE_ON_UNDEFINED = [ 'where', 'order' ]

export interface QueryProcessingVariablesConfig {
  removeIfNotDefined?: string[]
  removeIfNotUsed?: string[]
  inline?: string[]
}

export interface QueryProcessingConfig {
  variables: QueryProcessingVariablesConfig

  /**
   * If skip and take are found, they will be removed
   */
   disablePaging?: boolean
}

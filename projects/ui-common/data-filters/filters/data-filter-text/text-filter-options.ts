export interface ITextFilterOptions {
  /**
   * Limits filtering to these properties only.
   */
  properties?: string[]
  /**
   * When all properties are used this will omit those properties. This option
   * does nothing when `properties` option is defined.
   */
  omitProperties?: string[]
  /**
   * When using a loose matching, such as the default text filter that uses
   * string contains, this will tell the filter to use exact matching.
   *
   * default: `false`
   */
  exact: boolean
  /**
   * When using a string filter this will tell the filter to use case sensitive
   * matching.
   *
   * default: `false`
   */
  caseSensitive: boolean
}

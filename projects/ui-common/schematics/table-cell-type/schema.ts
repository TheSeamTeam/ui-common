export interface Schema {
  // The name of the table cell type.
  name: string

  // The path to create the table cell type.
  path?: string

  // The name of the project.
  project?: string

  displayBlock?: boolean

  inlineStyle?: boolean

  inlineTemplate?: boolean

  viewEncapsulation?: string

  changeDetection?: string

  prefix?: string

  style?: string

  type?: string

  skipTests?: boolean

  flat?: boolean

  skipImport?: boolean

  selector?: string

  skipSelector?: boolean

  module?: string

  export?: boolean

  entryComponent?: boolean

  lintFix?: boolean
}

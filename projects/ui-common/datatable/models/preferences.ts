export interface ITheSeamDatatablePreferencesColumn {
  prop: string
  width?: number
  canAutoResize?: boolean
  hidden?: boolean
}

export interface ITheSeamDatatablePreferences {
  columns?: ITheSeamDatatablePreferencesColumn[]
}

import { IconProp } from '@fortawesome/fontawesome-svg-core'

export interface ITiledSelectItem {
  name?: string
  value: string
  label: string
  icon?: string | IconProp
  disabled?: boolean
  hidden?: boolean
  customClass?: string
}

export type TiledSelectLayout = 'grid' | 'list'

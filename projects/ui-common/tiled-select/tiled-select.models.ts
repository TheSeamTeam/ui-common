import { SeamIcon } from '@theseam/ui-common/icon'

export interface ITiledSelectItem {
  name?: string
  value: string
  label: string
  icon?: SeamIcon
  disabled?: boolean
  hidden?: boolean
  customClass?: string
}

export type TiledSelectLayout = 'grid' | 'list'

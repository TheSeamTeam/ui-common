import { SeamIcon } from '@theseam/ui-common/icon'

export interface TheSeamTiledSelectItem {
  name?: string
  value: string
  label: string
  icon?: SeamIcon
  disabled?: boolean
  hidden?: boolean
  customClass?: string
}

export type TheSeamTiledSelectLayout = 'grid' | 'list'

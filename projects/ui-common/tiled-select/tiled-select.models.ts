import { SeamIcon } from '@theseam/ui-common/icon'

export interface TiledSelectItem {
  name?: string
  value: string
  label: string
  icon?: SeamIcon
  disabled?: boolean
  hidden?: boolean
  customClass?: string
}

export type TiledSelectLayout = 'grid' | 'list'

/** @deprecated Use `TiledSelectItem`. */
export type ITiledSelectItem = TiledSelectItem

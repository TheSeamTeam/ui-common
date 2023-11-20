import { SeamIcon } from '@theseam/ui-common/icon'

export enum DatapagePageView {
  Boards = 'boards',
  Table = 'table'
}

export function isDatapagePageViewProperty(propertyName: string): propertyName is DatapagePageView {
  return Object.values(DatapagePageView)
    .findIndex(value => value === propertyName) !== -1
}

export enum DatapageAnimation {
  None = 'none',
  Slide = 'slide',
  Fade = 'fade'
}

export function isDatapageAnimationProperty(propertyName: string): propertyName is DatapageAnimation {
  return Object.values(DatapageAnimation)
    .findIndex(value => value === propertyName) !== -1
}

export interface DatapagePageViewModel {
  label: string
  value: DatapagePageView
  icon: SeamIcon
  disabled?: boolean
}

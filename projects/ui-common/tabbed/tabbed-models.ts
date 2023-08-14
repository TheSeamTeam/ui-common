import { TemplateRef } from '@angular/core'

export interface TabbedTabAccessor {
  isActive: boolean
}

export interface TabbedTabContentAccessor {
  isActive: boolean
}

export interface TabbedItemAccessor {
  tabbedTabTpl?: TemplateRef<TabbedTabAccessor>
  tabbedContentTpl?: TemplateRef<TabbedTabContentAccessor>
  contentFromRoute: boolean
}

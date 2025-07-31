import { TemplateRef } from '@angular/core'

export interface TheSeamTabbedTabAccessor {
  isActive: boolean
}

export interface TheSeamTabbedTabContentAccessor {
  isActive: boolean
}

export interface TheSeamTabbedItemAccessor {
  tabbedTabTpl?: TemplateRef<TheSeamTabbedTabAccessor>
  tabbedContentTpl?: TemplateRef<TheSeamTabbedTabContentAccessor>
  contentFromRoute: boolean
}

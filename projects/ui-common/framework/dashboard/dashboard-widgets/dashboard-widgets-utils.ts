import { CdkDrag } from '@angular/cdk/drag-drop'
import { ElementRef } from '@angular/core'

import { getAttribute, hasAttribute } from '@theseam/ui-common/utils'

/**
 * Finds the closest CdkDrag to an element by looking at the DOM.
 * @param element Element relative to which to look for a cdkDrag.
 * @param openDialogs References to the currently available cdkDrag.
 */
export function getClosestWidgetCdkDrag(element: ElementRef<HTMLElement>, dragDirectives: CdkDrag<any>[]) {
  let parent: HTMLElement | null = element.nativeElement.parentElement

  while (parent && !(parent.classList.contains('cdk-drag') && hasAttribute(parent, 'data-widget-id'))) {
    parent = parent.parentElement
  }

  const parentId = parent ? getAttribute(parent, 'data-widget-id') : null
  return parentId ?
    dragDirectives.find(drag => getAttribute(drag.getRootElement(), 'data-widget-id') === parentId)
    : null
}

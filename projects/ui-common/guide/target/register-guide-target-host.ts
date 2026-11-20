import { afterNextRender, DestroyRef, ElementRef, inject } from '@angular/core'

import { TheSeamGuideTargetRegistry } from './guide-target-registry'

/**
 * Registers the current component's host element as guide target `name`, for
 * as long as the component lives. `[seamGuideTarget]` cannot go on a
 * component's own host, so this does the same from inside it.
 *
 * Call it in an injection context, such as the constructor. The host is
 * registered once it is rendered, because a target is only found while it is
 * in the page.
 */
export function registerGuideTargetHost(name: string): void {
  const registry = inject(TheSeamGuideTargetRegistry)
  const host = inject<ElementRef<Element>>(ElementRef).nativeElement
  afterNextRender(() => registry.register(name, host))
  inject(DestroyRef).onDestroy(() => registry.unregister(name, host))
}

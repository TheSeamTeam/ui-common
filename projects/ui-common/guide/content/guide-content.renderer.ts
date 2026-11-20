import {
  ApplicationRef,
  createComponent,
  EnvironmentInjector,
  inject,
  Injectable,
  Injector,
} from '@angular/core'

import { TheSeamGuideRef } from '../guide-ref'
import {
  TheSeamGuideContentContext,
  TheSeamGuideContentRenderer,
  TheSeamGuideContentView,
  TheSeamGuideViewSlot,
  THE_SEAM_GUIDE_CONTENT,
} from '../models/guide-content'

/**
 * Creates and destroys the Angular view behind a popover slot.
 *
 * Separate from `TheSeamGuideSession` so session specs can run against a fake
 * and stay free of a real `ApplicationRef`, and so the session stays free of
 * rendering concerns.
 */
@Injectable({ providedIn: 'root' })
export class TheSeamGuideDomContentRenderer
  implements TheSeamGuideContentRenderer
{
  private readonly _appRef = inject(ApplicationRef)
  private readonly _envInjector = inject(EnvironmentInjector)

  /**
   * Renders `slot` into `host`, which the caller owns.
   *
   * Views are attached to `ApplicationRef` rather than created through a
   * `ViewContainerRef`, because this is a `providedIn: 'root'` service and
   * there is no view container to reach. Attachment is what makes a view
   * change-detected; where its nodes sit in the DOM is independent of it,
   * which is what lets driver.js move `host` around as it rebuilds its
   * popover on every render.
   */
  render(
    slot: TheSeamGuideViewSlot,
    context: TheSeamGuideContentContext,
    host: HTMLElement,
  ): TheSeamGuideContentView {
    if (slot.kind === 'template') {
      const view = slot.template.createEmbeddedView(context)
      this._appRef.attachView(view)
      host.append(...view.rootNodes)
      return {
        destroy: () => {
          this._appRef.detachView(view)
          view.destroy()
        },
      }
    }

    const ref = createComponent(slot.component, {
      environmentInjector: this._envInjector,
      // DI rather than `setInput`: `data` is shallow-merged across three
      // layers, so it routinely carries keys a given component never declared
      // as an input, and `setInput` throws NG0303 for those.
      elementInjector: Injector.create({
        parent: this._envInjector,
        providers: [
          { provide: THE_SEAM_GUIDE_CONTENT, useValue: context },
          { provide: TheSeamGuideRef, useValue: context.guide },
        ],
      }),
    })
    this._appRef.attachView(ref.hostView)
    host.append(ref.location.nativeElement)
    return {
      destroy: () => {
        this._appRef.detachView(ref.hostView)
        ref.destroy()
      },
    }
  }
}

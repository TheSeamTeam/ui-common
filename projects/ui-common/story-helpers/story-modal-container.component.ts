import { CommonModule } from '@angular/common'
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  Injector,
  Input,
  signal,
  TemplateRef,
} from '@angular/core'
import { of } from 'rxjs'

import { ModalConfig, ModalRef, MODAL_DATA } from '@theseam/ui-common/modal'
import type { ComponentType } from '@theseam/ui-common/models'
import { TheSeamOverlayScrollbarDirective } from '@theseam/ui-common/scrollbar'

class FakeModalRef<T, R = any> implements Partial<ModalRef<T, R>> {
  afterOpened() {
    return of(undefined)
  }

  close(_dialogResult?: R): void {
    /* no-op in stories */
  }
}

/**
 * Renders its content (or an imperatively provided component/template) inside
 * a stand-in modal frame so stories can preview components that are normally
 * opened through the modal service.
 *
 * Three ways to provide content, checked in order:
 *  1. `[component]` input — renders via `ngComponentOutlet`. Kept for
 *     compatibility with existing app stories.
 *  2. `[template]` input — renders a `TemplateRef` via `ngTemplateOutlet`.
 *  3. Projected content (`<ng-content>`) — the preferred form for new stories
 *     because Storybook's default template auto-binds inputs/outputs.
 */
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'story-modal-container-component',
  imports: [CommonModule, TheSeamOverlayScrollbarDirective],
  template: `
    <div class="cdk-overlay-container">
      <div
        class="cdk-overlay-backdrop cdk-overlay-dark-backdrop cdk-overlay-backdrop-showing"
      ></div>
      <div
        class="cdk-global-overlay-wrapper"
        dir="ltr"
        style="justify-content: flex-start; align-items: center; pointer-events: auto"
        seamOverlayScrollbar
      >
        <div
          class="seam-modal-container modal-dialog modal-dialog-centered {{
            _modalSizeClass()
          }}"
          tabindex="-1"
        >
          <div class="modal-content">
            @if (_component(); as c) {
              <ng-container
                *ngComponentOutlet="c; injector: _componentInjector()"
              ></ng-container>
            } @else if (template) {
              <ng-container *ngTemplateOutlet="template"></ng-container>
            } @else {
              <ng-content></ng-content>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .seam-modal-container[tabindex='-1']:focus {
        outline: 0 !important;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoryModalContainerComponent<T = unknown, D = any> {
  constructor(private readonly _injector: Injector) {}

  @Input()
  set component(c: ComponentType<T> | null | undefined) {
    this._component.set(c ?? null)
  }

  @Input()
  set data(d: D | null | undefined) {
    this._data.set(d ?? null)
  }

  @Input()
  set modalConfig(config: ModalConfig<D> | null | undefined) {
    this._modalConfig.set(config ?? null)
  }
  get modalConfig(): ModalConfig<D> | null {
    return this._modalConfig()
  }

  @Input() template?: TemplateRef<unknown> | null

  protected readonly _component = signal<ComponentType<T> | null>(null)
  private readonly _data = signal<D | null>(null)
  private readonly _modalConfig = signal<ModalConfig<D> | null>(null)

  protected readonly _componentInjector = computed(() =>
    this._createInjector(this._data()),
  )

  // No default size — stories opt into a Bootstrap modal size via
  // `modalConfig.modalSize`, matching how the real ModalService is used.
  protected readonly _modalSizeClass = computed(() => {
    const size = this._modalConfig()?.modalSize
    return size ? `modal-${size}` : ''
  })

  private _createInjector(data: D | null): Injector {
    return Injector.create({
      providers: [
        { provide: ModalRef, useClass: FakeModalRef, deps: [] },
        { provide: MODAL_DATA, useValue: data ?? undefined },
      ],
      parent: this._injector,
    })
  }
}

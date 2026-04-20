import { componentWrapperDecorator, Decorator } from '@storybook/angular'

import { ModalConfig } from '@theseam/ui-common/modal'

import { StoryModalContainerComponent } from './story-modal-container.component'

export interface StoryModalDecoratorOptions {
  /**
   * Passed through to `StoryModalContainerComponent`'s `modalConfig` input.
   * Commonly used to opt into a Bootstrap modal size, e.g.
   * `{ modalSize: 'lg' }`.
   */
  modalConfig?: ModalConfig
}

/**
 * Wraps a story's rendered component in `<story-modal-container-component>`
 * so it previews inside a stand-in modal frame. Storybook's default template
 * binds the story's args to the wrapped component, so inputs/outputs (e.g.
 * for the Actions addon) work without extra wiring.
 *
 * Use as an entry in a story's `decorators` array:
 *
 * ```ts
 * const meta: Meta<MyModalComponent> = {
 *   title: 'Modal/My',
 *   component: MyModalComponent,
 *   decorators: [storyModalDecorator({ modalConfig: { modalSize: 'lg' } })],
 * }
 * ```
 */
export function storyModalDecorator(
  options?: StoryModalDecoratorOptions,
): Decorator {
  return (storyFn, storyContext) => {
    const result = componentWrapperDecorator(
      (story) => `
        <story-modal-container-component [modalConfig]="_storyModalConfig">
          ${story}
        </story-modal-container-component>
      `,
    )(storyFn, storyContext)

    return {
      ...result,
      props: {
        ...(result.props ?? {}),
        // Prefixed to avoid colliding with a story's own args.
        _storyModalConfig: options?.modalConfig ?? null,
      },
      moduleMetadata: {
        ...(result.moduleMetadata ?? {}),
        imports: [
          ...(result.moduleMetadata?.imports ?? []),
          StoryModalContainerComponent,
        ],
      },
    }
  }
}

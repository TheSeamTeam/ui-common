import { waitOnConditionAsync } from '@theseam/ui-common/utils'

/**
 * Workaround to wait on the animation to finish in browser, until a generic
 * broswer-based solution is added, for Storybook interactions.
 */
export async function animatingWait() {
  const selectAnimating = () => document.querySelectorAll('.seam-menu-container .ng-animating')
  if (selectAnimating().length === 0) {
    return
  }
  await waitOnConditionAsync(() => selectAnimating().length === 0, 1000)
}

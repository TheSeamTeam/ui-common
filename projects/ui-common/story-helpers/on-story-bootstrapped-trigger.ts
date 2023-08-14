import { APP_BOOTSTRAP_LISTENER, ComponentRef, ElementRef } from '@angular/core'

// TODO: Consider supporting a target selection function, so that complex
// selections that can't be expressed by a simple selector can be used.

/**
 * Can be used to trigger an event on a target element when the story component has been bootstrapped.
 *
 * Example:
 * ```
 * export const TouchExample1 = () => ({
 *   moduleMetadata: {
 *     providers: [ onStoryBootstrappedTrigger('input', 'blur') ]
 *   },
 *   props: { control: new FormControl('') },
 *   template: `
 *     <input type="text" [formControl]="control">
 *     Touched: {{ control.touched }}
 *   `
 * })
 * ```
 */
export function onStoryBootstrappedTrigger(targetSelector: string, eventName: string) {
  function bootstrapped(componentRef: ComponentRef<any>) {
    const elementRef = componentRef.injector.get(ElementRef, null)
    const target = elementRef?.nativeElement.querySelector(targetSelector)
    if (!target) {
      // eslint-disable-next-line no-console
      console.warn(`Unable to trigger event '${eventName}'. Target '${targetSelector}' not found.`)
    }

    const e = document.createEvent('HTMLEvents')
    e.initEvent('blur', false, true)
    target.dispatchEvent(e)
  }

  return {
    provide: APP_BOOTSTRAP_LISTENER,
    useValue: bootstrapped,
    multi: true
  }
}

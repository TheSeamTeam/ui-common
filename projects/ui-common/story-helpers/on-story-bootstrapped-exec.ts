import { APP_BOOTSTRAP_LISTENER, ComponentRef } from '@angular/core'
import { STORY } from '@storybook/angular/dist/ts3.9/client/preview/angular/app.token'
import { StoryFnAngularReturnType } from '@storybook/angular/dist/ts3.9/client/preview/types'
import { Observable } from 'rxjs'
import { first } from 'rxjs/operators'

/**
 * Can be used to access a stories component after the story has been bootstrapped.
 *
 * Example:
 * ```ts
 * @Component({
 *   selector: 'story-example',
 *   template: `Touched: {{ exControl.touched }}`
 * })
 * class StoryExampleComponent {
 *   exControl = new FormControl('')
 * }
 *
 * export const TouchExample2 = () => ({
 *   moduleMetadata: {
 *     declarations: [ StoryExampleComponent ],
 *     providers: [ onStoryBootstrappedExec((c: StoryExampleComponent) => c.exControl.markAsTouched()) ]
 *   },
 *   props: { },
 *   component: StoryExampleComponent
 * })
 * ```
 */
export function onStoryBootstrappedExec<T = any>(callback: (component: T) => void) {
  function bootstrapped(componentRef: ComponentRef<any>) {
    const data = componentRef.instance.target.injector.get(STORY, null) as Observable<StoryFnAngularReturnType> | null
    if (!data) {
      console.warn(`STORY provider not found.`)
      return
    }
    data?.pipe(first()).subscribe(story => {
      if (!story.component) {
        console.warn(`'onStoryBootstrappedExec' only supported on stories that provide 'component' property.`)
        return
      }

      let c = null
      for (let i = 0; i < componentRef.instance.target.length; i++) {
        const tmp = componentRef.instance.target._embeddedViews[i].nodes?.find((f: any) => f?.instance instanceof story.component)
        const comp = tmp?.instance
        if (comp) {
          c = comp
          break
        }
      }

      if (!c) {
        console.warn(`Story component instance not found.`)
        return
      }

      if (c) {
        callback(c)
      }
    })
  }

  return {
    provide: APP_BOOTSTRAP_LISTENER,
    useValue: bootstrapped,
    multi: true
  }
}

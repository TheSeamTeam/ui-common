import { APP_INITIALIZER, Injector } from '@angular/core'

import { AngularRenderer, applicationConfig } from '@storybook/angular'
import { DecoratorFunction } from 'storybook/internal/csf'

export const INJECTOR_TO_ARGS_PROPERTY_NAME = '__getInjector'

// TODO: Decide a better way to persist the injector reference than poluting
// args with a value that isn't really meant to be an arg.

/**
 * Storybook decorator that stores the Angular Injector in
 * args, for retrieval in play function.
 */
export const addInjectorGetterToArgs =
  (
    argName: string = INJECTOR_TO_ARGS_PROPERTY_NAME,
  ): DecoratorFunction<AngularRenderer> =>
  (story: any, context: any) => {
    // TODO: Test this more thoroughly.
    let injector: Injector | null = null
    context.args[argName] = () => injector
    return applicationConfig({
      providers: [
        {
          provide: APP_INITIALIZER,
          useFactory: (injectorService: Injector) => () => {
            injector = injectorService
          },
          deps: [Injector],
          multi: true,
        },
      ],
    })(story, context)
  }

export const getInjectorFromArgs = (
  args: any,
  argName: string = INJECTOR_TO_ARGS_PROPERTY_NAME,
): Injector => {
  if (!args || typeof args[argName] !== 'function') {
    throw Error(`Injector getter function '${argName}' not found.`)
  }
  const injector = args[argName]()
  if (!injector) {
    throw Error(
      `Injector not found. Did you add 'addInjectorGetterToArgs' to your story dectorators?`,
    )
  }

  return injector
}

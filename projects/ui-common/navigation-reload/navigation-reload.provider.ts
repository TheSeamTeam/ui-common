import { APP_INITIALIZER, Provider } from '@angular/core'
import { TheSeamNavigationReloadService } from './navigation-reload.service'
import { TheSeamNavigationReloadConfig } from './navigation-reload.config'

export function provideNavigationReload(config: TheSeamNavigationReloadConfig): Provider[] {
  return [
    TheSeamNavigationReloadService,
    {
      provide: APP_INITIALIZER,
      useFactory: (service: TheSeamNavigationReloadService) => () => service.initialize(config),
      deps: [ TheSeamNavigationReloadService ],
      multi: true
    }
  ]
}

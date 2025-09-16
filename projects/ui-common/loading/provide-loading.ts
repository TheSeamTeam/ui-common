import { EnvironmentProviders, importProvidersFrom, makeEnvironmentProviders } from '@angular/core'

import { INgxLoadingConfig, NgxLoadingModule } from 'ngx-loading'

import { defaultThemeConfig } from './loading-themes'

export function provideTheSeamLoading(loadingConfig: INgxLoadingConfig = defaultThemeConfig): EnvironmentProviders {
  return makeEnvironmentProviders([
    importProvidersFrom(NgxLoadingModule.forRoot(loadingConfig)),
  ])
}

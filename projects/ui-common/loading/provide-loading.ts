import { EnvironmentProviders, importProvidersFrom, makeEnvironmentProviders } from '@angular/core'

import { defaultThemeConfig } from '@theseam/ui-common/loading'
import { INgxLoadingConfig, NgxLoadingModule } from 'ngx-loading'

export function provideTheSeamLoading(loadingConfig: INgxLoadingConfig = defaultThemeConfig): EnvironmentProviders {
  return makeEnvironmentProviders([
    importProvidersFrom(NgxLoadingModule.forRoot(loadingConfig)),
  ])
}

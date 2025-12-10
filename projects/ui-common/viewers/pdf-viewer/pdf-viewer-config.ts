import {
  EnvironmentProviders,
  InjectionToken,
  makeEnvironmentProviders,
} from '@angular/core'

export interface TheSeamPdfViewerConfig {
  pdfJsWorkerSrc?: string
}

export const THESEAM_PDF_VIEWER_CONFIG_PROVIDER =
  new InjectionToken<TheSeamPdfViewerConfig>('TheSeamPdfViewerConfigProvider')

export function providePdfViewerConfig(
  config: TheSeamPdfViewerConfig,
): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: THESEAM_PDF_VIEWER_CONFIG_PROVIDER, useValue: config },
  ])
}

export interface TheSeamNavigationReloadConfig {
  shouldReload?: (state: any, url: string) => boolean
  dummyUrl?: string
}

export const THESEAM_RELOAD_PROPERTY = 'seamReload'

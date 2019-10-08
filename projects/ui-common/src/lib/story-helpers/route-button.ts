// import { button } from '@storybook/addon-knobs'

/**
 * Until I find a way to avoid '@storybook/addon-knobs' from interfering with
 * NgZone I can't import it in the knob when built by ng-packagr.
 */
export function routeButton(buttonKnob: any, url: string) {
  return buttonKnob(url, () => {
    location.hash = `#${url}`
    return false
  })
}

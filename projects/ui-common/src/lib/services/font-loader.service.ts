import { Injectable } from '@angular/core'

import { Observable, Subscriber } from 'rxjs'
import WebFont from 'webfontloader'

import { hasProperty } from '../utils'

export type TheSeamFontEvents =
  { type: 'loading' } |
  { type: 'active' } |
  { type: 'inactive' } |
  { type: 'fontloading', familyName: string, fvd: string } |
  { type: 'fontactive', familyName: string, fvd: string } |
  { type: 'fontinactive', familyName: string, fvd: string }

/**
 * Service to help loading fonts.
 *
 * Currently this is just a wrapper for the parts of webfontloader that we need.
 * Eventually this should be generic enough that we can switch loaders without
 * config differences being confusing.
 */
@Injectable({
  providedIn: 'root'
})
export class TheSeamFontLoaderService {

  constructor() { }

  /**
   * Since this method is just a wrapper for webfontloader right now it accepts
   * anything webfontloader's config accepts, so the event callbacks can still
   * be used, but you should us the emitted objects instead. If we decide to
   * support other font loaders then the event callbacks will most likely be
   * removed.
   *
   * NOTE: If you need to use the events callbacks for some reason, this
   * method's returned observable will still need to be subscribed to, because
   * it doesn't start till subscribed to.
   */
  public load(config: WebFont.Config): Observable<TheSeamFontEvents> {
    return new Observable((subscriber: Subscriber<TheSeamFontEvents>) => {
      WebFont.load({
        ...config,
        /** This event is triggered when all fonts have been requested. */
        loading: () => {
          if (hasProperty(config, 'loading')) {
            config.loading()
          }
          subscriber.next({ type: 'loading' })
        },
        /** This event is triggered when the fonts have rendered. */
        active: () => {
          if (hasProperty(config, 'active')) {
            config.active()
          }
          subscriber.next({ type: 'active' })
        },
        /** This event is triggered when the browser does not support linked fonts or if none of the fonts could be loaded. */
        inactive: () => {
          if (hasProperty(config, 'inactive')) {
            config.inactive()
          }
          subscriber.next({ type: 'inactive' })
        },
        /** This event is triggered once for each font that's loaded. */
        fontloading: (familyName: string, fvd: string) => {
          if (hasProperty(config, 'fontloading')) {
            config.fontloading(familyName, fvd)
          }
          subscriber.next({ type: 'fontloading', familyName, fvd })
        },
        /** This event is triggered once for each font that renders. */
        fontactive: (familyName: string, fvd: string) => {
          if (hasProperty(config, 'fontactive')) {
            config.fontactive(familyName, fvd)
          }
          subscriber.next({ type: 'fontactive', familyName, fvd })
        },
        /** This event is triggered if the font can't be loaded. */
        fontinactive: (familyName: string, fvd: string) => {
          if (hasProperty(config, 'fontinactive')) {
            config.fontinactive(familyName, fvd)
          }
          subscriber.next({ type: 'fontinactive', familyName, fvd })
        },
      })
    })
  }

}

import { inject, Injectable, OnDestroy } from '@angular/core'
import { Router, NavigationSkipped, RouterConfigOptions } from '@angular/router'
import { Subject, takeUntil } from 'rxjs'

import { THESEAM_RELOAD_PROPERTY, TheSeamNavigationReloadConfig } from './navigation-reload.config'

@Injectable({
  providedIn: 'root'
})
export class TheSeamNavigationReloadService implements OnDestroy {
  private readonly _router = inject(Router)
  private readonly _destroy$ = new Subject<void>()

  ngOnDestroy(): void {
    this._destroy$.next()
    this._destroy$.complete()
  }

  initialize(config: TheSeamNavigationReloadConfig): void {
    this._checkRouterConfig()
    this._router.events.pipe(takeUntil(this._destroy$)).subscribe(event => {
      if (event instanceof NavigationSkipped) {
        const url = event.url
        const navigationState = history.state

        const shouldReloadFn = config.shouldReload ?? (() => navigationState[THESEAM_RELOAD_PROPERTY])

        const shouldReload =
          shouldReloadFn(navigationState, url) &&
          url === this._router.url

        if (shouldReload) {
          this.reloadComponent(url, config?.dummyUrl)
        }
      }
    })
  }

  reloadComponent(url: string, dummyUrl?: string): void {
    this._router.navigateByUrl(dummyUrl || '/', { skipLocationChange: true }).then(() => {
      this._router.navigateByUrl(url, { skipLocationChange: true })
    })
  }

  private _checkRouterConfig() {
    const config: RouterConfigOptions = this._router.config as any // Type hack, config is internal
    if (config.onSameUrlNavigation === 'reload') {
      // eslint-disable-next-line no-console
      console.warn(
        'WARNING: Router is configured with onSameUrlNavigation: "reload". ' +
        'This component relies on "ignore" to trigger reloads via NavigationSkipped. ' +
        'Reload behavior may not work as expected. Consider reverting to "ignore" ' +
        'or updating the reload logic.'
      )
    }
  }
}

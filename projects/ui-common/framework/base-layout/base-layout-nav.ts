import { Observable } from 'rxjs'

/**
 * A class implementing this interface can be registered as a nav with the
 * `TheSeamBaseLayoutComponent`.
 *
 * A benefit to registering the nav is that the base layout can control the
 * expand state.
 */
export interface ITheSeamBaseLayoutNav {
  /** Is nav expanded. */
  expanded$: Observable<boolean>

  /** Expand the nav. */
  expand: () => void

  /** Collapse the nav. */
  collapse: () => void

  /** Toggle the expand state. */
  toggle: () => void
}

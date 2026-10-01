import {
  DEFAULT_LABEL_GAP_PX,
  DEFAULT_LABEL_MAX_STEPS,
  LabelBox,
  resolveLabelOverlaps,
} from './label-layout'
import { isLabelVisibleAtSize } from './label-visibility'

export interface MapFeatureLabel {
  key: string
  text: string
  /**
   * Where the label anchors. This is the polygon's own label point, not the
   * centre of `bounds` - see `polygonLabelPoint`.
   */
  position: google.maps.LatLng
  /** Extent of the shape, used only to decide whether it is big enough. */
  bounds: google.maps.LatLngBounds
  /** Higher keeps its position when two labels collide. */
  priority: number
}

export interface MapFeatureLabelsOverlayOptions {
  /** Clear space left between two stacked labels. */
  gapPx?: number
  /** How many box-heights a label may be pushed to avoid a collision. */
  maxSteps?: number
}

export const MAP_FEATURE_LABEL_CLASS = 'seam-map-feature-label'

/**
 * Renders one label per feature group.
 *
 * The `google.maps.OverlayView` subclass is declared INSIDE the constructor
 * rather than at module scope. This codebase's Google Maps API loader is
 * lazy (see `TheSeamLazyMapsApiLoader`), so `google.maps` is not guaranteed
 * to exist when this module is first imported — a top-level
 * `class X extends google.maps.OverlayView` evaluates that reference at
 * import time and throws `ReferenceError: google is not defined` before the
 * API script has loaded. `GoogleMapsContextMenuOverlayView` in
 * `google-maps-contextmenu.ts` is declared locally for the same reason.
 * `MapFeatureLabelsOverlay` itself is only ever constructed once the map
 * (and therefore the API) is ready, via `GoogleMapsService`, so deferring the
 * subclass to construction time is safe.
 *
 * Internally it is a single OverlayView holding one child div per group,
 * rather than one overlay each: with many fields that is one `draw()` per
 * frame updating N child positions instead of N overlays each doing
 * projection work.
 *
 * Labels live in the `markerLayer` pane, which sits above the `overlayLayer`
 * pane the Data layer renders polygons into (so labels are not decided by DOM
 * insertion order) and below the `floatPane` `GoogleMapsContextMenu` uses (so
 * the context menu still stays on top). `pointer-events: none` means labels
 * never take part in hit testing and cannot interfere with clicks, drawing, or
 * the context-menu overlay.
 *
 * Overlapping labels are pushed above or below one another by
 * `resolveLabelOverlaps`, and hidden when there is nowhere left to put them.
 * Only the layout decision lives there; this class measures and applies,
 * because only it has the DOM.
 *
 * `draw()` measures in one batch before it positions anything. Reading
 * `offsetWidth` forces a synchronous layout, so interleaving a read and a
 * write per label would cost one layout per label per frame; doing every read
 * first and every write after costs one for the whole pass.
 *
 * It measures on every draw rather than caching, because a label's width
 * depends on the font it is actually rendered in. Labels drawn before a
 * webfont finishes loading measure in the fallback face, and a cache keyed on
 * the text — which has not changed — would keep resolving collisions against
 * metrics that are no longer on screen, displacing labels that overlap
 * nothing.
 *
 * For the same reason it repaints on the document's `loadingdone` font event.
 * The first paint of any map happens in the fallback face, and the Maps API
 * loads a Roboto of its own that these labels inherit, so metrics can change
 * well after the labels are on screen. `document.fonts.ready` is not enough:
 * it settles once, and a font that starts loading after that never reopens
 * it, leaving the view with a layout measured against a face it is no longer
 * drawn in. `loadingdone` fires per batch, so each one gets a repaint.
 */
export class MapFeatureLabelsOverlay {
  private readonly _overlay: google.maps.OverlayView & { refresh(): void }

  constructor(
    getLabels: () => MapFeatureLabel[],
    options: MapFeatureLabelsOverlayOptions = {},
  ) {
    const gapPx = options.gapPx ?? DEFAULT_LABEL_GAP_PX
    const maxSteps = options.maxSteps ?? DEFAULT_LABEL_MAX_STEPS

    const container = document.createElement('div')
    container.style.position = 'absolute'
    container.style.left = '0'
    container.style.top = '0'
    container.style.pointerEvents = 'none'

    const elements = new Map<string, HTMLDivElement>()
    let labels: MapFeatureLabel[] = []

    const elementFor = (label: MapFeatureLabel): HTMLDivElement => {
      let element = elements.get(label.key)
      if (!element) {
        element = document.createElement('div')
        element.className = MAP_FEATURE_LABEL_CLASS
        element.style.position = 'absolute'
        element.style.transform = 'translate(-50%, -50%)'
        element.style.pointerEvents = 'none'
        element.style.whiteSpace = 'nowrap'
        container.appendChild(element)
        elements.set(label.key, element)
      }
      if (element.textContent !== label.text) {
        element.textContent = label.text
      }
      return element
    }

    let onFontsLoaded: (() => void) | undefined

    class Overlay extends google.maps.OverlayView {
      onAdd(): void {
        this.getPanes()?.markerLayer.appendChild(container)

        // Optional chaining: `FontFaceSet` is absent in some environments
        // this runs in (jsdom under Jest, older browsers). Missing it only
        // costs the corrective repaint — every later draw measures afresh
        // regardless.
        onFontsLoaded = () => this.draw()
        document.fonts?.addEventListener?.('loadingdone', onFontsLoaded)
      }

      onRemove(): void {
        if (onFontsLoaded) {
          document.fonts?.removeEventListener?.('loadingdone', onFontsLoaded)
          onFontsLoaded = undefined
        }
        container.parentElement?.removeChild(container)
        elements.clear()
      }

      /** Re-read the labels and repaint. Call when the value or grouping changes. */
      refresh(): void {
        labels = getLabels()
        this.draw()
      }

      draw(): void {
        const projection = this.getProjection()
        if (!projection) {
          return
        }

        const seen = new Set<string>()

        // Pass 1, writes only: settle the text, and project. A label too
        // small to show, or off the projection, is dropped here and takes no
        // further part - a label nobody can see must not displace one they
        // can. Everything stays visible for now: a hidden element measures
        // 0x0, and pass 2 is about to measure.
        const candidates: {
          label: MapFeatureLabel
          element: HTMLDivElement
          x: number
          y: number
        }[] = []

        for (const label of labels) {
          seen.add(label.key)
          const element = elementFor(label)
          element.hidden = false

          const anchor = projection.fromLatLngToDivPixel(label.position)
          const ne = projection.fromLatLngToDivPixel(
            label.bounds.getNorthEast(),
          )
          const sw = projection.fromLatLngToDivPixel(
            label.bounds.getSouthWest(),
          )

          if (
            anchor &&
            ne &&
            sw &&
            isLabelVisibleAtSize(Math.abs(ne.x - sw.x), Math.abs(ne.y - sw.y))
          ) {
            candidates.push({ label, element, x: anchor.x, y: anchor.y })
          } else {
            element.hidden = true
          }
        }

        // Pass 2, reads only: one layout flush for every label, rather than
        // one per label.
        const boxes: LabelBox[] = candidates.map((candidate) => ({
          key: candidate.label.key,
          x: candidate.x,
          y: candidate.y,
          width: candidate.element.offsetWidth,
          height: candidate.element.offsetHeight,
          priority: candidate.label.priority,
        }))

        // Pass 3, writes only: place what fits, hide what does not.
        const placements = resolveLabelOverlaps(boxes, { gapPx, maxSteps })
        for (const candidate of candidates) {
          const y = placements.get(candidate.label.key)
          if (y === null || y === undefined) {
            candidate.element.hidden = true
            continue
          }
          candidate.element.style.left = `${candidate.x}px`
          candidate.element.style.top = `${y}px`
        }

        for (const [key, element] of elements) {
          if (!seen.has(key)) {
            element.parentElement?.removeChild(element)
            elements.delete(key)
          }
        }
      }
    }

    this._overlay = new Overlay()
  }

  /** Attach to (or detach from, with `null`) a map. */
  setMap(map: google.maps.Map | null): void {
    this._overlay.setMap(map)
  }

  /** Re-read the labels and repaint. Call when the value or grouping changes. */
  refresh(): void {
    this._overlay.refresh()
  }

  destroy(): void {
    this._overlay.setMap(null)
  }
}

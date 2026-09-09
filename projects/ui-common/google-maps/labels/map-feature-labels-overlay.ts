import { isLabelVisibleAtSize } from './label-visibility'

export interface MapFeatureLabel {
  key: string
  text: string
  bounds: google.maps.LatLngBounds
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
 * Known limitation: no collision de-confliction. Labels of nearby groups will
 * overlap at low zoom. The size threshold reduces but does not eliminate this.
 */
export class MapFeatureLabelsOverlay {
  private readonly _overlay: google.maps.OverlayView & { refresh(): void }

  constructor(getLabels: () => MapFeatureLabel[]) {
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

    class Overlay extends google.maps.OverlayView {
      onAdd(): void {
        this.getPanes()?.markerLayer.appendChild(container)
      }

      onRemove(): void {
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

        for (const label of labels) {
          seen.add(label.key)
          const element = elementFor(label)

          const ne = projection.fromLatLngToDivPixel(
            label.bounds.getNorthEast(),
          )
          const sw = projection.fromLatLngToDivPixel(
            label.bounds.getSouthWest(),
          )
          const centre = projection.fromLatLngToDivPixel(
            label.bounds.getCenter(),
          )
          if (!ne || !sw || !centre) {
            element.hidden = true
            continue
          }

          const visible = isLabelVisibleAtSize(
            Math.abs(ne.x - sw.x),
            Math.abs(ne.y - sw.y),
          )
          element.hidden = !visible
          if (visible) {
            element.style.left = `${centre.x}px`
            element.style.top = `${centre.y}px`
          }
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

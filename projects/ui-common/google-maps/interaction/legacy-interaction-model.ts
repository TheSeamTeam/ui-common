import { Polygon } from 'geojson'

import { isFeatureSelected } from '../google-maps-feature-helpers'
import {
  MapDrawOutcome,
  MapFeatureInteractionFlags,
  MapInteractionContext,
  MapInteractionModel,
} from './map-interaction-model'

/**
 * The behaviour this module has always had: one boundary, clicking a feature
 * selects it and arms its handles, and the draw button toggles drawing.
 *
 * Two applications depend on this and are not being updated, so it must not
 * drift. Every decision here mirrors the pre-strategy service exactly.
 */
export class LegacyInteractionModel implements MapInteractionModel {
  readonly id = 'legacy' as const

  onFeatureClick(
    feature: google.maps.Data.Feature,
    context: MapInteractionContext,
  ): void {
    context.selectGroup(context.groups.keyOf(feature), feature)
  }

  onMapClick(context: MapInteractionContext): void {
    context.selectGroup(null, null)
  }

  onDrawFinished(
    polygon: Polygon,
    context: MapInteractionContext,
  ): MapDrawOutcome {
    const target = context.allowHoles
      ? context.findContainingFeature(polygon)
      : undefined

    // Legacy parity: the pre-strategy service found the exterior feature with
    // geoJsonPolygonFromDataFeature, which returns undefined for MultiPolygon,
    // so a MultiPolygon never matched. The shared search is now
    // MultiPolygon-aware for grouped mode; narrow it back here. Two apps depend
    // on this behaviour and are not being updated.
    const isPolygon = target?.getGeometry()?.getType() === 'Polygon'

    return target && isPolygon
      ? { kind: 'hole', target }
      : { kind: 'newFeature', groupKey: null }
  }

  featureFlags(
    feature: google.maps.Data.Feature,
    context: MapInteractionContext,
  ): MapFeatureInteractionFlags {
    // Selection alone arms handles here; `editingEnabled` is the only gate,
    // and `computeFeatureStyle` applies it.
    return { geometryEditingArmed: true, clicksAllowed: true }
  }

  allowsContextMenu(
    feature: google.maps.Data.Feature,
    context: MapInteractionContext,
  ): boolean {
    return isFeatureSelected(feature)
  }
}

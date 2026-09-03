import { Polygon } from 'geojson'

import {
  MapDrawOutcome,
  MapFeatureInteractionFlags,
  MapInteractionContext,
  MapInteractionModel,
} from './map-interaction-model'

/**
 * Multi-field behaviour, where selection and geometry editing are separate
 * concerns.
 *
 * With edit mode off, clicking a polygon selects its whole group and mutates
 * nothing — the point being that a stray click can never nudge a vertex on an
 * imported boundary, which is close to unrecoverable without an undo feature.
 *
 * With edit mode on, the selected group is editable and a click on open map
 * starts a new drawing. Existing polygons stop taking clicks so that a click
 * never means both "select this" and "place a vertex". The cost is that
 * switching fields requires leaving edit mode, which is deliberate.
 */
export class GroupedInteractionModel implements MapInteractionModel {
  readonly id = 'grouped' as const

  onFeatureClick(
    feature: google.maps.Data.Feature,
    context: MapInteractionContext,
  ): void {
    const key = context.groups.keyOf(feature)

    if (!context.editMode) {
      context.selectGroup(key, feature)
      return
    }

    // In edit mode, other groups are non-clickable, so this can only be the
    // selected group. Note which polygon was touched, since `Delete` acts on
    // that one alone. Google's vertex editor still receives the click.
    if (key === context.getSelectedKey()) {
      context.selectGroup(key, feature)
    }
  }

  onMapClick(context: MapInteractionContext): void {
    if (context.editMode) {
      context.startDrawing()
      return
    }
    context.selectGroup(null, null)
  }

  onDrawFinished(
    polygon: Polygon,
    context: MapInteractionContext,
  ): MapDrawOutcome {
    const selectedKey = context.getSelectedKey()

    if (selectedKey === null) {
      // No selection means no field to cut into. Skipping the containment
      // search entirely is what stops a polygon drawn over an unrelated field
      // from punching a hole in it.
      return { kind: 'newFeature', groupKey: null }
    }

    if (context.allowHoles) {
      const target = context.findContainingFeature(polygon, selectedKey)
      if (target) {
        return { kind: 'hole', target }
      }
    }

    return { kind: 'newFeature', groupKey: selectedKey }
  }

  featureFlags(
    feature: google.maps.Data.Feature,
    context: MapInteractionContext,
  ): MapFeatureInteractionFlags {
    if (!context.editMode) {
      return { geometryEditingArmed: false, clicksAllowed: true }
    }

    const selectedKey = context.getSelectedKey()
    const isSelectedGroup =
      selectedKey !== null && context.groups.keyOf(feature) === selectedKey

    return {
      geometryEditingArmed: isSelectedGroup,
      clicksAllowed: isSelectedGroup,
    }
  }

  allowsContextMenu(
    feature: google.maps.Data.Feature,
    context: MapInteractionContext,
  ): boolean {
    return true
  }
}

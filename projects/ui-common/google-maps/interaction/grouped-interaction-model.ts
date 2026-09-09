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
 * Clicking a polygon selects its whole group and mutates nothing, whether
 * edit mode is on or off — the point being that a stray click can never nudge
 * a vertex on an imported boundary, which is close to unrecoverable without
 * an undo feature. With edit mode on, the selected group's own geometry also
 * goes to Google's vertex/midpoint editor, and a click on open map starts a
 * new drawing.
 *
 * A click on a polygon is suppressed only while a draw is actually in
 * progress — that is the one moment a click is genuinely ambiguous between
 * "select this" and "place a vertex". Between draws there is no ambiguity at
 * all, since Terra Draw is not capturing pointer input, so every polygon
 * stays clickable and selecting a different field never requires leaving
 * edit mode first.
 */
export class GroupedInteractionModel implements MapInteractionModel {
  readonly id = 'grouped' as const

  onFeatureClick(
    feature: google.maps.Data.Feature,
    context: MapInteractionContext,
  ): void {
    // While a draw is in progress, a click on a polygon is placing a vertex,
    // not a selection. Defensive: the service's data `click` listener already
    // guards on `isDrawing()` before calling in here (see onMapClick's
    // identical defence below), but this model does not rely solely on that
    // guard.
    if (context.isDrawing) {
      return
    }

    // Selecting mutates nothing, so it is safe on any group regardless of
    // edit mode — including a group other than the one currently selected.
    // Note which polygon was touched, since `Delete` acts on that one alone.
    // Google's vertex editor still receives the click for the selected
    // group's own geometry.
    context.selectGroup(context.groups.keyOf(feature), feature)
  }

  onMapClick(context: MapInteractionContext): void {
    // A click while a draw is already in progress is placing a vertex, not a
    // map click. Defensive: the service's map `click` listener already guards
    // on `isDrawing()` before calling in here, but `startDrawing()` calling
    // `setMode('polyline')` again would reset the in-progress path, so this
    // model does not rely solely on the caller's guard.
    if (context.isDrawing) {
      return
    }
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
      // The group stays visibly selected while a draw is in progress (F3) —
      // it is the target the drawn polygon will join — but its vertex/midpoint
      // handles are disarmed for the duration, since Google's edit handles are
      // separate interactive elements that would otherwise compete with Terra
      // Draw for pointer events near the polygon. Only the selected group is
      // ever reshapeable; every group, selected or not, is merely selectable.
      geometryEditingArmed: isSelectedGroup && !context.isDrawing,
      // Suppressed only while Terra Draw is actually capturing pointer input
      // — the one window in which a click is ambiguous between selecting and
      // placing a vertex. Between draws every polygon stays clickable
      // regardless of selection, so a click can switch the selection to a
      // different field without leaving edit mode.
      clicksAllowed: !context.isDrawing,
    }
  }

  allowsContextMenu(
    feature: google.maps.Data.Feature,
    context: MapInteractionContext,
  ): boolean {
    // Every item this menu offers is a destructive edit (Delete Polygon,
    // Delete Field), so it must not be reachable outside edit mode, and —
    // matching legacy's `isFeatureSelected(feature)` — not for a feature the
    // user has not selected. clicksAllowed above stays gated on drawing alone
    // (a non-selected group must remain clickable so it can BECOME the
    // selection), but offering destructive actions for a field the user has
    // not selected is more surprising than useful, so the menu is narrower
    // than what is merely clickable.
    const selectedKey = context.getSelectedKey()
    return (
      context.editMode &&
      selectedKey !== null &&
      context.groups.keyOf(feature) === selectedKey
    )
  }
}

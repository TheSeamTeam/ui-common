import { Polygon } from 'geojson'

import { FeatureGroupRegistry } from '../feature-groups/feature-group-registry'
import { TheSeamMapFeatureStyleContext } from '../feature-style/compute-feature-style'
import { TheSeamMapInteractionMode } from './interaction-mode'

/** What an interaction model decides for a single feature's style. */
export type MapFeatureInteractionFlags = Pick<
  TheSeamMapFeatureStyleContext,
  'geometryEditingArmed' | 'clicksAllowed'
>

/** What the service should do with a finished drawing. */
export type MapDrawOutcome =
  | {
      kind: 'newFeature'
      /** The group to join, or null to start a new group. */
      groupKey: string | null
    }
  | { kind: 'hole'; target: google.maps.Data.Feature }

/**
 * What a model may ask of the map. Deliberately narrow: everything here is
 * trivially fakeable, which is what makes the models unit-testable.
 */
export interface MapInteractionContext {
  readonly groups: FeatureGroupRegistry
  readonly editingEnabled: boolean
  readonly allowHoles: boolean
  /** Whether the map is currently in edit mode. Always false in legacy. */
  readonly editMode: boolean
  /** The selected group key, or null. */
  getSelectedKey(): string | null
  /**
   * Select a group and note which feature the interaction landed on. Passing
   * null for the key clears the selection.
   */
  selectGroup(
    key: string | null,
    feature: google.maps.Data.Feature | null,
  ): void
  /** Begin polygon drawing. */
  startDrawing(): void
  /**
   * An existing feature that fully contains `polygon`, restricted to a group
   * when `groupKey` is given, and to features `accept` returns true for when
   * given. Matches any part of a MultiPolygon.
   *
   * `accept` filters candidates DURING the search rather than after it, so a
   * rejected candidate does not stop the search the way discarding the whole
   * result afterward would — the next candidate is still considered. That
   * distinction is what legacy mode's Polygon-only filter relies on to match
   * the pre-strategy service's search order exactly.
   */
  findContainingFeature(
    polygon: Polygon,
    groupKey?: string,
    accept?: (feature: google.maps.Data.Feature) => boolean,
  ): google.maps.Data.Feature | undefined
}

/**
 * The behaviour that differs between the single-boundary map this module was
 * built for and the multi-field map it now also has to be.
 *
 * Implementations answer five questions and hold no Maps API state of their
 * own; `GoogleMapsService` keeps owning the plumbing.
 */
export interface MapInteractionModel {
  readonly id: TheSeamMapInteractionMode

  /** A click landed on a feature. */
  onFeatureClick(
    feature: google.maps.Data.Feature,
    context: MapInteractionContext,
  ): void

  /** A click landed on the map, not on a feature. */
  onMapClick(context: MapInteractionContext): void

  /** A drawing was completed. */
  onDrawFinished(
    polygon: Polygon,
    context: MapInteractionContext,
  ): MapDrawOutcome

  /** Interaction flags for one feature, fed into `computeFeatureStyle`. */
  featureFlags(
    feature: google.maps.Data.Feature,
    context: MapInteractionContext,
  ): MapFeatureInteractionFlags

  /** Whether a right-click on this feature opens the context menu. */
  allowsContextMenu(
    feature: google.maps.Data.Feature,
    context: MapInteractionContext,
  ): boolean
}

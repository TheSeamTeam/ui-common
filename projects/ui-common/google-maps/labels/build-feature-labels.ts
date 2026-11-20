import { MultiPolygon, Polygon, Position } from 'geojson'

import { polygonLabelPoint } from '@theseam/ui-common/utils'

/** One map feature, reduced to what label placement actually needs. */
export interface LabelSourceFeature {
  groupKey: string
  /** This feature's label text. Empty when it carries none. */
  text: string
  geometry: Polygon | MultiPolygon
  selected: boolean
}

/** `[x, y]`, i.e. `[lng, lat]`, matching GeoJSON order. */
export type LabelPosition = [number, number]

/** `[[minX, minY], [maxX, maxY]]`, i.e. south-west then north-east. */
export type LabelBounds = [[number, number], [number, number]]

export interface FeatureLabelSpec {
  key: string
  text: string
  /** Where the label anchors. Always inside the polygon it names. */
  position: LabelPosition
  /** Extent used to decide whether the shape is big enough to label. */
  bounds: LabelBounds
  /** Rank for collision resolution; higher keeps its place. */
  priority: number
}

export interface BuildFeatureLabelsOptions {
  /**
   * One label on every polygon rather than one per group. A MultiPolygon
   * feature contributes one label per part, so a field split across two
   * parcels is labelled on both.
   */
  perPolygon: boolean
}

/**
 * Turns the features on the map into the labels to draw.
 *
 * Deliberately free of any `google.maps` type: everything here is GeoJSON and
 * arithmetic, so the placement rules can be tested without a map, a
 * projection, or a DOM.
 */
export function buildFeatureLabels(
  features: LabelSourceFeature[],
  options: BuildFeatureLabelsOptions,
): FeatureLabelSpec[] {
  const candidates: Candidate[] = []

  for (const group of groupFeatures(features)) {
    if (!group.text) {
      continue
    }
    candidates.push(
      ...(options.perPolygon ? perPolygon(group) : perGroup(group)),
    )
  }

  return rankByPriority(candidates)
}

/** A label before its priority is known. */
interface Candidate {
  key: string
  text: string
  position: LabelPosition
  bounds: LabelBounds
  selected: boolean
  area: number
}

interface Group {
  key: string
  /** The group's label, which is the first non-empty one its features carry. */
  text: string
  parts: { polygon: Polygon; selected: boolean }[]
}

function groupFeatures(features: LabelSourceFeature[]): Group[] {
  const groups = new Map<string, Group>()

  for (const feature of features) {
    let group = groups.get(feature.groupKey)
    if (!group) {
      group = { key: feature.groupKey, text: '', parts: [] }
      groups.set(feature.groupKey, group)
    }
    if (!group.text && feature.text) {
      group.text = feature.text
    }
    for (const polygon of polygonParts(feature.geometry)) {
      group.parts.push({ polygon, selected: feature.selected })
    }
  }

  return [...groups.values()]
}

function perGroup(group: Group): Candidate[] {
  const parts = group.parts
    .map((part) => ({ ...part, area: ringArea(part.polygon) }))
    .filter((part) => part.area > 0 || group.parts.length === 1)
  if (parts.length === 0) {
    return []
  }

  // Anchor on the largest part rather than the middle of the group. A group's
  // combined extent is frequently empty in the middle — two parcels either
  // side of a road, say — and a label centred on it would sit on neither.
  const largest = parts.reduce((a, b) => (b.area > a.area ? b : a))
  const position = polygonLabelPoint(largest.polygon)
  if (!position) {
    return []
  }

  return [
    {
      key: group.key,
      text: group.text,
      position,
      // The bounds stay the whole group's: the size threshold asks "is this
      // group big enough on screen to be worth labelling", which is about the
      // group, not about whichever part won the anchor.
      bounds: boundsOf(group.parts.map((part) => part.polygon)),
      selected: parts.some((part) => part.selected),
      area: parts.reduce((total, part) => total + part.area, 0),
    },
  ]
}

function perPolygon(group: Group): Candidate[] {
  const candidates: Candidate[] = []

  group.parts.forEach((part, index) => {
    const position = polygonLabelPoint(part.polygon)
    if (!position) {
      return
    }
    candidates.push({
      // Indexed within the group so the key is stable for as long as the
      // geometry is, which is what lets the overlay reuse the same element.
      key: `${group.key}#${index}`,
      text: group.text,
      position,
      bounds: boundsOf([part.polygon]),
      selected: part.selected,
      area: ringArea(part.polygon),
    })
  })

  return candidates
}

/**
 * Assigns each label an integer rank: selected first, then larger first, then
 * by key.
 *
 * A rank rather than the area itself, so that selection always outranks size
 * no matter how the two compare numerically — there is no area large enough
 * for an unselected group to outrank a selected one.
 */
function rankByPriority(candidates: Candidate[]): FeatureLabelSpec[] {
  const ordered = [...candidates].sort(
    (a, b) =>
      Number(b.selected) - Number(a.selected) ||
      b.area - a.area ||
      (a.key < b.key ? -1 : a.key > b.key ? 1 : 0),
  )

  return ordered.map((candidate, index) => ({
    key: candidate.key,
    text: candidate.text,
    position: candidate.position,
    bounds: candidate.bounds,
    priority: ordered.length - index,
  }))
}

function polygonParts(geometry: Polygon | MultiPolygon): Polygon[] {
  if (geometry.type === 'Polygon') {
    return [geometry]
  }
  return geometry.coordinates.map((coordinates) => ({
    type: 'Polygon',
    coordinates,
  }))
}

/**
 * The outer ring's area by the shoelace formula, in square degrees.
 *
 * Planar rather than geodesic on purpose: this only ever ranks one polygon
 * against another, and over the extent of a single map the distortion is the
 * same for all of them. `@turf/area` would be more correct and more expensive
 * for an answer that is then thrown away.
 */
function ringArea(polygon: Polygon): number {
  const ring = polygon.coordinates[0]
  if (!ring || ring.length < 3) {
    return 0
  }

  let total = 0
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    total += (ring[j][0] + ring[i][0]) * (ring[j][1] - ring[i][1])
  }
  return Math.abs(total / 2)
}

function boundsOf(polygons: Polygon[]): LabelBounds {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  for (const polygon of polygons) {
    for (const ring of polygon.coordinates) {
      for (const position of ring) {
        const [x, y] = position as Position
        minX = Math.min(minX, x)
        minY = Math.min(minY, y)
        maxX = Math.max(maxX, x)
        maxY = Math.max(maxY, y)
      }
    }
  }

  return [
    [minX, minY],
    [maxX, maxY],
  ]
}

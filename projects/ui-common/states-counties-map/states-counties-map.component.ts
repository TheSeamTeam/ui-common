import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  effect,
  inject,
  input,
  output,
  viewChild,
  ViewEncapsulation,
} from '@angular/core'
import type { Feature, FeatureCollection, Geometry } from 'geojson'
import { geoAlbers, geoPath, type GeoPath } from 'd3-geo'
import { select, type Selection } from 'd3-selection'
import { feature as topoFeature, mesh as topoMesh } from 'topojson-client'
import type { GeometryCollection, Topology } from 'topojson-specification'

import { TheSeamStatesCountiesMapCountyEvent } from './states-counties-map.models'
import { TheSeamStatesCountiesMapDataService } from './states-counties-map-data.service'
import {
  isCountySelected,
  stateIdFromCountyId,
} from './states-counties-map.helpers'

@Component({
  selector: 'seam-states-counties-map',
  template: `<div #wrapper class="states-counties-map-wrapper"></div>`,
  styleUrls: ['./states-counties-map.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TheSeamStatesCountiesMapComponent {
  /** FIPS state code (e.g., `"48"` for Texas). Null/undefined renders nothing. */
  readonly stateNumber = input<string | null | undefined>(undefined)

  /** FIPS county codes to highlight with the `county-selected` class. */
  readonly selectedCountyIds = input<readonly string[]>([])

  readonly countyClick = output<TheSeamStatesCountiesMapCountyEvent>()
  readonly countyEnter = output<TheSeamStatesCountiesMapCountyEvent>()
  readonly countyLeave = output<TheSeamStatesCountiesMapCountyEvent>()

  private readonly _wrapper =
    viewChild.required<ElementRef<HTMLDivElement>>('wrapper')

  private readonly _data = inject(TheSeamStatesCountiesMapDataService)

  private _topologyPromise: Promise<Topology> | null = null
  private _lastRenderedState: string | null = null
  private _renderSerial = 0

  constructor() {
    // Re-render whenever the state number changes.
    effect(() => {
      const state = this.stateNumber() ?? null
      if (state !== this._lastRenderedState) {
        this._lastRenderedState = state
        void this._render()
      }
    })

    // Re-apply selection classes whenever selection changes (no full re-render).
    effect(() => {
      // Touch the signal so the effect tracks it.
      this.selectedCountyIds()
      this._updateSelectedCounties()
    })

    // Reflow on container resize.
    effect((onCleanup) => {
      const host = this._wrapper().nativeElement
      const observer = new ResizeObserver(() => void this._render())
      observer.observe(host)
      onCleanup(() => observer.disconnect())
    })
  }

  private _loadTopology(): Promise<Topology> {
    if (!this._topologyPromise) {
      this._topologyPromise = this._data.load()
    }
    return this._topologyPromise
  }

  private async _render(): Promise<void> {
    const serial = ++this._renderSerial
    const host = this._wrapper().nativeElement
    const rect = host.getBoundingClientRect()
    const width = rect.width
    const height = rect.height

    select(host).select('svg').remove()

    const state = this.stateNumber()
    if (!state) {
      return
    }

    const topology = await this._loadTopology()
    if (serial !== this._renderSerial) {
      return
    }

    const statesLayer = topology.objects['states'] as GeometryCollection
    const countiesLayer = topology.objects['counties'] as GeometryCollection

    const states = topoFeature(
      topology,
      statesLayer,
    ) as FeatureCollection<Geometry>

    const stateFeature = states.features.find(
      (d) => Number(d.id) === Number(state),
    )
    if (!stateFeature) {
      return
    }

    const projection = geoAlbers()
    const path: GeoPath = geoPath().projection(projection)

    projection.scale(1).translate([0, 0])
    const b = path.bounds(stateFeature)
    const s =
      0.95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height)
    const t: [number, number] = [
      (width - s * (b[1][0] + b[0][0])) / 2,
      (height - s * (b[1][1] + b[0][1])) / 2,
    ]
    projection.scale(s).translate(t)

    const svg: Selection<SVGSVGElement, unknown, null, undefined> = select(host)
      .append('svg')
      .attr('width', width)
      .attr('height', height)

    svg
      .append('path')
      .datum(topoMesh(topology, statesLayer, (a, b1) => a !== b1))
      .attr('class', 'mesh')
      .attr('d', path as unknown as string)

    svg
      .append('path')
      .datum(stateFeature)
      .attr('class', 'outline')
      .attr('d', path as unknown as string)
      .attr('id', 'land')

    svg
      .append('clipPath')
      .attr('id', 'clip-land')
      .append('use')
      .attr('xlink:href', '#land')

    const counties = topoFeature(
      topology,
      countiesLayer,
    ) as FeatureCollection<Geometry>

    const stateNum = `${parseInt(state, 10)}`

    svg
      .selectAll<SVGPathElement, Feature<Geometry>>('path[county-id]')
      .data(counties.features)
      .enter()
      .append('path')
      .attr('d', path as unknown as string)
      .attr('county-id', (d) => `${d.id}`.padStart(5, '0'))
      .style('stroke', (d) =>
        stateIdFromCountyId(d.id as string | number) === stateNum
          ? '#000'
          : 'transparent',
      )
      .on('click', (_event, d) => {
        this.countyClick.emit({
          id: `${d.id}`.padStart(5, '0'),
          feature: d,
        })
      })
      .on('mouseenter', (_event, d) => {
        this.countyEnter.emit({
          id: `${d.id}`.padStart(5, '0'),
          feature: d,
        })
      })
      .on('mouseleave', (_event, d) => {
        this.countyLeave.emit({
          id: `${d.id}`.padStart(5, '0'),
          feature: d,
        })
      })

    this._updateSelectedCounties()
  }

  private _updateSelectedCounties(): void {
    const host = this._wrapper().nativeElement
    const selected = this.selectedCountyIds()
    select(host)
      .select<SVGSVGElement>('svg')
      .selectAll<SVGPathElement, Feature<Geometry>>('path[county-id]')
      .attr('class', (d) =>
        isCountySelected(d.id as string | number, selected)
          ? 'county-selected'
          : 'county',
      )
  }
}

import { Injectable } from '@angular/core'
import { Observable, Subject } from 'rxjs'

export interface MapControlLayersTile {
  name: string
  label: string
  type: 'polygon'
}

export interface MapControlLayersChangeEvent {
  added?: MapControlLayersTile[]
  removed?: MapControlLayersTile[]
}

@Injectable()
export class MapControlLayersTilesService {

  private readonly _tilesChangedSubject = new Subject<MapControlLayersChangeEvent>()

  private _tiles: MapControlLayersTile[] = []

  public readonly tilesChanged: Observable<MapControlLayersChangeEvent> = this._tilesChangedSubject.asObservable()

  public get tiles(): MapControlLayersTile[] { return this._tiles }

  public addTiles(tiles: MapControlLayersTile[]): void {

  }

  public removeTiles(tiles: MapControlLayersTile[]): void {

  }
}

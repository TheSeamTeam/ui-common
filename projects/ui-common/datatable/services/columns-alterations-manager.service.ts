import { Injectable } from '@angular/core'

import { ColumnsAlteration } from '../models/columns-alteration'
import { TheSeamDatatableColumn } from '../models/table-column'

export interface ColumnsAlterationsChangedRecord {
  type: 'added' | 'removed'
  alteration: ColumnsAlteration
}

export interface ColumnsAlterationsChangedEvent {
  changes: ColumnsAlterationsChangedRecord[]
}

@Injectable()
export class ColumnsAlterationsManagerService {

  private _alterations: ColumnsAlteration[] = []

  public get alterations(): ColumnsAlteration[] {
    return [ ...this._alterations ]
  }

  public addAlterations(alterations: ColumnsAlteration[]): void {
    this._alterations = [ ...this._alterations, ...alterations ]
  }

  public removeAlterations(alterations: ColumnsAlteration[]): void {
    this._alterations = this._alterations.filter(x => alterations.findIndex(y => y === x) !== -1)
  }

  public applyAlterations(columns: TheSeamDatatableColumn[]): void {
    for (const a of this._alterations) {
      a.apply(columns)
    }

    this._removeNonPersistantAlterations()
  }

  private _removeNonPersistantAlterations(): void {
    const nonPersistent = this._alterations.filter(x => !x.persistent)
    this.removeAlterations(nonPersistent)
  }

}

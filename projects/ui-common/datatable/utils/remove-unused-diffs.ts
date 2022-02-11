import { KeyValueDiffer } from '@angular/core'

import { TheSeamDatatableColumn } from './../models/table-column'

export function removeUnusedDiffs(
  cols: TheSeamDatatableColumn[],
  colDiffersInp: { [propName: string]: KeyValueDiffer<any, any> },
  colDiffersTpl: { [propName: string]: KeyValueDiffer<any, any> }
): void {
  const inpKeys = Object.keys(colDiffersInp)
  inpKeys.filter(k => cols.findIndex(c => c.prop === k) === -1)
    .forEach(k => { delete colDiffersInp[k] })

  const tplKeys = Object.keys(colDiffersTpl)
  tplKeys.filter(k => cols.findIndex(c => c.prop === k) === -1)
    .forEach(k => { delete colDiffersTpl[k] })
}

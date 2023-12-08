import { Directive, Inject, Self } from '@angular/core'

import { DataFilter, THESEAM_DATA_FILTER } from '../data-filter'

@Directive({
  selector: '[seamDataFilter]'
})
export class DataFilterDirective {

  private _filter?: DataFilter

  constructor(
    @Self() @Inject(THESEAM_DATA_FILTER) dataFilters: DataFilter[]
  ) {
    if (dataFilters && dataFilters.length > 0) {
      this._filter = dataFilters[0]
    }
  }

  get filter() {
    return this._filter
  }

}

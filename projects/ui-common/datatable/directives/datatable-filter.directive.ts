import { Directive, Inject, Self } from '@angular/core'

import { IDataFilter, THESEAM_DATA_FILTER } from '@theseam/ui-common/data-filters'

@Directive({
  selector: '[seamDatatableFilter]'
})
export class DatatableFilterDirective {

  private _filter?: IDataFilter

  constructor(
    @Self() @Inject(THESEAM_DATA_FILTER) dataFilters: IDataFilter[]
  ) {
    if (dataFilters && dataFilters.length > 0) {
      this._filter = dataFilters[0]
    }
  }

  get filter() {
    return this._filter
  }

}

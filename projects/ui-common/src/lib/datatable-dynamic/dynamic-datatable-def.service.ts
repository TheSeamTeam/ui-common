import { ComponentType } from '@angular/cdk/portal'
import { Inject, Injectable } from '@angular/core'

import { IDataExporter, THESEAM_DATA_EXPORTER } from '../data-exporter/index'
import { THESEAM_DATA_FILTER_DEF } from '../data-filters/index'
import { IDataFilter } from '../data-filters/index'
import { DynamicValueHelperService } from '../dynamic/index'
import { notNullOrUndefined } from '../utils/index'

@Injectable()
export class DynamicDatatableDefService {

  constructor(
    @Inject(THESEAM_DATA_EXPORTER) public _dataExporters: IDataExporter[],
    @Inject(THESEAM_DATA_FILTER_DEF) public _dataFilters: { name: string, component: ComponentType<IDataFilter> }[],
    private _valueHelper: DynamicValueHelperService,
  ) { }


}

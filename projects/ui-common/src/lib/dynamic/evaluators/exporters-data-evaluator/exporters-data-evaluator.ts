import { Injectable, Injector } from '@angular/core'

import { notNullOrUndefined } from '@lib/ui-common/utils'
import { IDataExporter, THESEAM_DATA_EXPORTER } from '../../../data-exporter/data-exporter'
import { IDynamicValueEvaluator } from '../../models/dynamic-value-evaluator'

import { IExportersDataValue } from './exporters-data-value'

@Injectable()
export class ExportersDataEvaluator implements IDynamicValueEvaluator<'exporters-data'> {

  public readonly type = 'exporters-data'

  constructor(
    private _injector: Injector
  ) { }

  public async eval(value: IExportersDataValue<IDataExporter[]>, context?: any): Promise<{ exporters: IDataExporter[] }> {
    return this.evalSync(value, context)
  }

  public evalSync(value: IExportersDataValue<IDataExporter[]>, context?: any): { exporters: IDataExporter[] } {
    return {
      exporters: this._exporters(value.exporters || [])
    }
  }

  private _exporters(exporters: string[]) {
    const dataExporters: IDataExporter[] = (<any>this._injector.get(THESEAM_DATA_EXPORTER) || []) as IDataExporter[]
    return exporters
      .map(e => dataExporters.find(de => de.name === e))
      .filter(notNullOrUndefined)
  }

}

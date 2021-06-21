import { NgModule } from '@angular/core'

import { CSVDataExporter } from './exporters/csv-exporter'
import { XLSXDataExporter } from './exporters/xlsx-exporter'

import { THESEAM_DATA_EXPORTER } from './data-exporter'

@NgModule({
  declarations: [],
  imports: [],
  providers: [
    { provide: THESEAM_DATA_EXPORTER, useClass: CSVDataExporter, multi: true },
    { provide: THESEAM_DATA_EXPORTER, useClass: XLSXDataExporter, multi: true }
  ]
})
export class TheSeamDataExporterModule { }

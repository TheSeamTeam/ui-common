import { InjectionToken } from '@angular/core'

import { TheSeamDatatableAccessor } from '../models/datatable-accessor'

export const THESEAM_DATATABLE_ACCESSOR = new InjectionToken<TheSeamDatatableAccessor>(
  'TheSeamDatatableAccessor'
)

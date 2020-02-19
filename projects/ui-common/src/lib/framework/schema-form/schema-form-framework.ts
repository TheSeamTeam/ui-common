import { Injectable } from '@angular/core'

import {Framework} from '@ajsf/core'

import { TheSeamSchemaFormCheckboxComponent } from '../schema-form-controls/schema-form-checkbox/schema-form-checkbox.component'
import { TheSeamSchemaFormSubmitComponent } from '../schema-form-controls/schema-form-submit/schema-form-submit.component'

import { TheSeamSchemaFormFrameworkComponent } from './schema-form-framework.component'

@Injectable()
export class TheSeamFramework extends Framework {
  name = 'seam-framework'

  framework = TheSeamSchemaFormFrameworkComponent

  widgets = {
    'checkbox': TheSeamSchemaFormCheckboxComponent,
    'submit': TheSeamSchemaFormSubmitComponent
  }
}

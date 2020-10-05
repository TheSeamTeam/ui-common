import { Injectable } from '@angular/core'

import { Framework } from '@ajsf/core'

import { TheSeamSchemaFormCheckboxComponent } from '../schema-form-controls/schema-form-checkbox/schema-form-checkbox.component'
import { TheSeamSchemaFormInputComponent } from '../schema-form-controls/schema-form-input/schema-form-input.component'
import { TheSeamSchemaFormNumberComponent } from '../schema-form-controls/schema-form-number/schema-form-number.component'
import { TheSeamSchemaFormSelectComponent } from '../schema-form-controls/schema-form-select/schema-form-select.component'
import { TheSeamSchemaFormSubmitComponent } from '../schema-form-controls/schema-form-submit/schema-form-submit.component'

import { TheSeamSchemaFormFrameworkComponent } from './schema-form-framework.component'

@Injectable()
export class TheSeamFramework extends Framework {
  name = 'seam-framework'

  framework = TheSeamSchemaFormFrameworkComponent

  widgets = {
    'checkbox': TheSeamSchemaFormCheckboxComponent,
    'submit': TheSeamSchemaFormSubmitComponent,
    'text': TheSeamSchemaFormInputComponent,
    'number': TheSeamSchemaFormNumberComponent,
    'select': TheSeamSchemaFormSelectComponent
  }
}

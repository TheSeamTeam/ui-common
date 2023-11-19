import { Injectable } from '@angular/core'

import { Framework } from '@ajsf/core'

import { TheSeamSchemaFormCheckboxComponent } from '../schema-form-controls/schema-form-checkbox/schema-form-checkbox.component'
import { TheSeamSchemaFormInputComponent } from '../schema-form-controls/schema-form-input/schema-form-input.component'
import { TheSeamSchemaFormNumberComponent } from '../schema-form-controls/schema-form-number/schema-form-number.component'
import { TheSeamSchemaFormSelectComponent } from '../schema-form-controls/schema-form-select/schema-form-select.component'
import { TheSeamSchemaFormSubmitSplitComponent } from '../schema-form-controls/schema-form-submit-split/schema-form-submit-split.component'
import { TheSeamSchemaFormSubmitComponent } from '../schema-form-controls/schema-form-submit/schema-form-submit.component'
import { TheSeamSchemaFormDividerComponent } from '../schema-form-controls/schema-form-divider/schema-form-divider.component'
import { TheSeamSchemaFormTelComponent } from '../schema-form-controls/schema-form-tel/schema-form-tel.component'
import { TheSeamSchemaFormTiledSelectComponent } from '../schema-form-controls/schema-form-tiled-select/schema-form-tiled-select.component'

import { TheSeamSchemaFormFrameworkComponent } from './schema-form-framework.component'

@Injectable()
export class TheSeamFramework extends Framework {
  name = 'seam-framework'

  framework = TheSeamSchemaFormFrameworkComponent

  widgets = {
    'checkbox': TheSeamSchemaFormCheckboxComponent,
    // 'submit': TheSeamSchemaFormSubmitComponent,
    'submit': TheSeamSchemaFormSubmitSplitComponent,
    'text': TheSeamSchemaFormInputComponent,
    'number': TheSeamSchemaFormNumberComponent,
    'select': TheSeamSchemaFormSelectComponent,
    'divider': TheSeamSchemaFormDividerComponent,
    'tel': TheSeamSchemaFormTelComponent,
    'tiled-select': TheSeamSchemaFormTiledSelectComponent

    // 'file': // TODO: Implement
    // 'date': // TODO: Implement
    // 'map': // TODO: Implement
    // 'wizard': // TODO: Implement
    // 'image': // TODO: Implement
    // 'tabs': // TODO: Implement
    // 'card': // TODO: Implement
    // 'richtext': // TODO: Implement
  }
}

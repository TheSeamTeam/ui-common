import { Inject, Injectable, InjectionToken, Optional, inject } from '@angular/core'

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
import { hasProperty } from '@theseam/ui-common/utils'

export type TheSeamSchemaFormFrameworkOverrides = Omit<Framework, 'name' | 'framework' | 'stylesheet' | 'scripts'>

export const THESEAM_SCHEMA_FRAMEWORK_OVERRIDES = new InjectionToken<TheSeamSchemaFormFrameworkOverrides>('THESEAM_SCHEMA_FRAMEWORK_OVERRIDES')

export function extendFramework(toExtend: Framework, extendFrameworkOrName: Framework | string): void {
  // console.log('extendFramework', toExtend, extendFrameworkOrName)
  const _overrides: Framework[] | null = inject(Framework, { optional: true }) as Framework[] | null
  const overrides = typeof extendFrameworkOrName === 'string'
    ? (_overrides || []).filter(x => x.name === extendFrameworkOrName)
    : [ extendFrameworkOrName ]

  // console.log(_overrides, overrides)

  if (overrides) {
    for (const override of overrides) {
      // console.log('override', override)
      if (hasProperty(override, 'framework')) {
        toExtend.framework = override.framework
      }

      if (hasProperty(override, 'widgets')) {
        toExtend.widgets = { ...toExtend.widgets, ...override.widgets }
      }

      if (hasProperty(override, 'stylesheets')) {
        toExtend.stylesheets = { ...toExtend.stylesheets, ...override.stylesheets }
      }

      if (hasProperty(override, 'scripts')) {
        toExtend.scripts = { ...toExtend.scripts, ...override.scripts }
      }
    }
  }
}

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

    // 'date': // TODO: Implement
    // 'file': // TODO: Implement
    // 'image': // TODO: Implement
    // 'richtext': // TODO: Implement
    // 'tabs': // TODO: Implement
    // 'wizard': // TODO: Implement
    // 'card': // TODO: Implement
    // 'map': // TODO: Implement
  }

  constructor(
    @Optional() @Inject(THESEAM_SCHEMA_FRAMEWORK_OVERRIDES) _overrides?: TheSeamSchemaFormFrameworkOverrides[]
  ) {
    super()

    // console.log('TheSeamFramework', _overrides, this)

    if (_overrides) {
      for (const override of _overrides) {
        // console.log('override', override)
        if (hasProperty(override, 'widgets')) {
          this.widgets = { ...this.widgets, ...override.widgets }
        }
      }
    }
  }
}

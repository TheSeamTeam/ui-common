import 'jest-preset-angular/setup-jest'
import './jest-global-mocks'

import * as globalStorybookConfig from '../../.storybook/preview' // path of your preview.js file
import { setGlobalConfig } from '../../.storybook/testing/sb-testing'

setGlobalConfig(globalStorybookConfig)

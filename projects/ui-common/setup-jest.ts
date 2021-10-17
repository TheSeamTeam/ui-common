import 'jest-preset-angular/setup-jest'
import './jest-global-mocks'

import { setGlobalConfig } from '@storybook/testing-angular'
import * as globalStorybookConfig from '../../.storybook/preview' // path of your preview.js file

setGlobalConfig(globalStorybookConfig)

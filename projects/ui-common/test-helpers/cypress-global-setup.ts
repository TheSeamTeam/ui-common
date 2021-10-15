import { setGlobalConfig } from '@storybook/testing-angular'
import * as globalStorybookConfig from '../../../.storybook/preview' // path of your preview.js file

import { cypressGlobalStyles } from './cypress-global-styles'

export function cypressGlobalSetup(): void {
  setGlobalConfig({
    ...globalStorybookConfig,
    decorators: [
      ...((globalStorybookConfig as any)?.decorators || []),
      cypressGlobalStyles
    ]
  })
}

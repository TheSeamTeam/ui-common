// @ts-ignore
import { setCompodocJson } from '@storybook/addon-docs/angular'

// import { addDecorator } from '@storybook/angular'

// import { withTests } from '@storybook/addon-jest'

// import results from '../addon-jest.testresults.json'
// console.log('results', results)

// addDecorator(
//   withTests({
//     results,
//   })
// );

// @ts-ignore
// eslint-disable-next-line import/extensions, import/no-unresolved
import docJson from '../documentation.json'

setCompodocJson(docJson)

export const parameters = {
  docs: {
    // inlineStories: true,
    source: {
      type: 'dynamic'
    }
  }
}

// export const decorators = [
//   withTests({
//     results,
//     filesExt: '((\\.specs?)|(\\.tests?))?(\\.ts)?$',
//   })
// ]

// addDecorator(withTests({
//   results,
//   filesExt: '((\\.specs?)|(\\.tests?))?(\\.ts)?$',
// }))

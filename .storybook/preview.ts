// @ts-ignore
// import { setCompodocJson } from '@storybook/addon-docs/angular'

// @ts-ignore
// eslint-disable-next-line import/extensions, import/no-unresolved
import docJson from '../documentation.json'

// setCompodocJson(docJson)
// @ts-ignore
window.__STORYBOOK_COMPODOC_JSON__ = docJson

export const parameters = {
  docs: {
    inlineStories: false,
    source: {
      type: 'dynamic'
    }
  }
}

// export const decorators = []

global.Buffer = global.Buffer || require('buffer').Buffer

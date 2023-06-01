// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// import { setCompodocJson } from '@storybook/addon-docs/angular'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line import/extensions, import/no-unresolved
import docJson from '../documentation.json'

if (docJson) {
  // const arrStringDefaultValue = (arr) => {
  //   for (const a of arr) {
  //     if (Array.isArray(a)) {
  //       arrStringDefaultValue(a)
  //     } else {
  //       objStripDefaultValue(a)
  //     }
  //   }
  // }

  // const objStripDefaultValue = (obj) => {
  //   if (obj === undefined || obj === null) {
  //     return
  //   }

  //   if (obj.hasOwnProperty('defaultValue')) {
  //     delete obj.defaultValue
  //   }

  //   const keys = Object.keys(obj)
  //   for (const k of keys) {
  //     if (Array.isArray(obj[k])) {
  //       arrStringDefaultValue(obj[k])
  //     } else {
  //       objStripDefaultValue(obj[k])
  //     }
  //   }
  // }

  // objStripDefaultValue(docJson)

  // eslint-disable-next-line no-inner-declarations
  function filterObject(obj, key) {
    for (const i in obj) {
        if (!Object.prototype.hasOwnProperty.call(obj, i)) continue
        if (i === key) {
            delete obj[key]
        } else if (typeof obj[i] === 'object') {
            filterObject(obj[i], key)
        }
    }
    return obj
  }
  filterObject(docJson, 'defaultValue')

  // docJson.pipes.forEach(p => {
  //   if (p.properties) {
  //     p.properties.forEach(p2 => {
  //       if (p2.hasOwnProperty('defaultValue')) {
  //         delete p2.defaultValue
  //       }
  //     })
  //   }
  //   if (p.methods) {
  //     p.methods.forEach(m => {
  //       m.args.forEach(a => {
  //         if (a.hasOwnProperty('defaultValue')) {
  //           delete a.defaultValue
  //         }
  //       })
  //       m.jsdoctags.forEach(a => {
  //         if (a.hasOwnProperty('defaultValue')) {
  //           delete a.defaultValue
  //         }
  //       })
  //     })
  //   }
  //   if (p.constructorObj) {
  //     p.constructorObj.args.forEach(a => {
  //       if (a.hasOwnProperty('defaultValue')) {
  //         delete a.defaultValue
  //       }
  //     })
  //   }
  // })

  // docJson.interfaces.forEach(i => {
  //   i.properties.forEach(p => {
  //     if (p.hasOwnProperty('defaultValue')) {
  //       delete p.defaultValue
  //     }
  //   })
  //   p.methods.forEach(m => {
  //     m.args.forEach(a => {
  //       if (a.hasOwnProperty('defaultValue')) {
  //         delete a.defaultValue
  //       }
  //     })
  //     m.jsdoctags.forEach(a => {
  //       if (a.hasOwnProperty('defaultValue')) {
  //         delete a.defaultValue
  //       }
  //     })
  //   })
  //   if (p.constructorObj) {
  //     p.constructorObj.args.forEach(a => {
  //       if (a.hasOwnProperty('defaultValue')) {
  //         delete a.defaultValue
  //       }
  //     })
  //   }
  // })

  // docJson.injectables.forEach(p => {
  //   if (p.properties) {
  //     p.properties.forEach(p2 => {
  //       if (p2.hasOwnProperty('defaultValue')) {
  //         delete p2.defaultValue
  //       }
  //     })
  //   }
  //   if (p.methods) {
  //     p.methods.forEach(m => {
  //       m.args.forEach(a => {
  //         if (a.hasOwnProperty('defaultValue')) {
  //           delete a.defaultValue
  //         }
  //       })
  //       m.jsdoctags.forEach(a => {
  //         if (a.hasOwnProperty('defaultValue')) {
  //           delete a.defaultValue
  //         }
  //       })
  //     })
  //   }
  //   if (p.constructorObj) {
  //     p.constructorObj.args.forEach(a => {
  //       if (a.hasOwnProperty('defaultValue')) {
  //         delete a.defaultValue
  //       }
  //     })
  //   }
  // })

  // // interceptors

  // docJson.classes.forEach(p => {
  //   if (p.properties) {
  //     p.properties.forEach(p2 => {
  //       if (p2.hasOwnProperty('defaultValue')) {
  //         delete p2.defaultValue
  //       }
  //     })
  //   }
  //   if (p.methods) {
  //     p.methods.forEach(m => {
  //       m.args.forEach(a => {
  //         if (a.hasOwnProperty('defaultValue')) {
  //           delete a.defaultValue
  //         }
  //       })
  //       m.jsdoctags.forEach(a => {
  //         if (a.hasOwnProperty('defaultValue')) {
  //           delete a.defaultValue
  //         }
  //       })
  //     })
  //   }
  //   if (p.constructorObj) {
  //     p.constructorObj.args.forEach(a => {
  //       if (a.hasOwnProperty('defaultValue')) {
  //         delete a.defaultValue
  //       }
  //     })
  //   }
  // })
}

// setCompodocJson(docJson)
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
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

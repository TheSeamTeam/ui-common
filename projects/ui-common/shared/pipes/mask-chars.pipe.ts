// NOTE: ng-packagr ignores the "types" and "typeRoots" settings in tsconfig.
// Unless there is a way to make it stop ignoring those settings, tripple slash
// reference to a `.d.ts` file was the only way I could stop the missing types
// error.
// tslint:disable-next-line: no-reference
/// <reference path="./lodash-es.d.ts" />

import { Pipe, PipeTransform } from '@angular/core'

import { padEnd, padStart } from 'lodash-es'

@Pipe({
  name: 'maskChars'
})
export class MaskCharsPipe implements PipeTransform {

  transform(value: string, replacementChar: string = '*', ignoreCount: number = 0, ignoreFrom: 'left' | 'right' = 'right'): string {
    if (ignoreFrom === 'right') {
      const s = value || ''
      return padStart(s.substring(s.length - ignoreCount, s.length), s.length, replacementChar)
    } else if (ignoreFrom === 'left') {
      const s = value || ''
      return padEnd(s.substring(0, ignoreCount), s.length, replacementChar)
    }

    return value
  }

}

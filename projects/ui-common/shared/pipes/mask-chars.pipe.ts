import { Pipe, PipeTransform } from '@angular/core'

import { padEnd, padStart } from '@theseam/ui-common/utils'

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

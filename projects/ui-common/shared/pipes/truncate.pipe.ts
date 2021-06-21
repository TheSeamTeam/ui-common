import { Pipe, PipeTransform } from '@angular/core'

@Pipe({
  name: 'truncate'
})
export class TruncatePipe implements PipeTransform {

  transform(value: string, length: number = 30, appendEllipsis: boolean = true): string {
    let val = value

    if (value && typeof value === 'string' && value.length > length) {
      val = value.substr(0, length)
      if (appendEllipsis) {
        val += '...'
      }
    }

    return val
  }

}

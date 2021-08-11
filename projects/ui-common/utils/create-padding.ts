
export function createPadding(len: number, chars: string): string {
  // if (chars.length <= len) {
  //   return chars
  // }

  if (chars.length === 0) {
    throw Error(`Padding characters must be at least 1 char length.`)
  }

  let str = chars
  while (str.length < len) {
    str += chars
  }

  if (str.length > len) {
    str = str.slice(0, len)
  }

  return str
}

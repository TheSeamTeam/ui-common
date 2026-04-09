// NOTE: Based on https://www.npmjs.com/package/trim-repeated

const escapeRegExp = (s: string) =>
  s.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&').replace(/-/g, '\\x2d')

/**
 * Trim a consecutively repeated substring: foo--bar---baz → foo-bar-baz.
 */
export function trimRepeated(str: string, target: string): string {
  return str.replace(new RegExp(`(?:${escapeRegExp(target)}){2,}`, 'g'), target)
}

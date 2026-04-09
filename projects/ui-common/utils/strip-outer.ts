// NOTE: Based on https://www.npmjs.com/package/strip-outer

const escapeRegExp = (s: string) =>
  s.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&').replace(/-/g, '\\x2d')

/**
 * Strip a substring from the start/end of a string.
 */
export function stripOuter(input: string, substring: string): string {
  const escaped = escapeRegExp(substring)
  return input.replace(new RegExp(`^${escaped}|${escaped}$`, 'g'), '')
}

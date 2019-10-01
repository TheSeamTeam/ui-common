
/**
 * Explaination:
 *  ^       - beginning of the string
 *  (?:     - beginning of a non-captured group
 *  [a-z]+  - any character of 'a' to 'z' 1 or more times
 *  :       - string (colon character)
 *  )?      - end of the non-captured group. Group appearing 0 or 1 times
 *  //      - string (two forward slash characters)
 *  'i'     - non case-sensitive flag
 *
 * source: https://stackoverflow.com/a/19709846
 */
const IS_ABSOLUTE_URL_REGEX = new RegExp('^(?:[a-z]+:)?//', 'i')

export function isAbsoluteUrl(url: string): boolean {
  return IS_ABSOLUTE_URL_REGEX.test(url)
}

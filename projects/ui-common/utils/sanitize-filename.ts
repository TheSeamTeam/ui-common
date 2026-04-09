import { stripOuter } from './strip-outer'
import { trimRepeated } from './trim-repeated'

// NOTE: Mostly based on https://www.npmjs.com/package/filenamify

const MAX_FILENAME_LENGTH = 100

// eslint-disable-next-line no-control-regex
const reReserved = /[<>:"/\\|?*\x00-\x1F]/g
const reWindowsNames = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])$/i
const reControlChars = /[\u0000-\u001f\u0080-\u009f]/g // eslint-disable-line no-control-regex
const reRelativePath = /^\.+/

export interface SanitizeFilenameOptions {
  /**
   * Replacement string.
   *
   * @default '_'
   */
  replacement?: string
  /**
   * Max file length.
   *
   * @default 100
   */
  maxLength?: number
}

const defaultOptions: SanitizeFilenameOptions = {
  replacement: '_',
  maxLength: MAX_FILENAME_LENGTH,
}

export function sanitizeFilename(
  filename: string,
  options?: SanitizeFilenameOptions,
): string {
  const opts = {
    ...defaultOptions,
    ...(options || {}),
  }

  const replacement = opts.replacement === undefined ? '!' : opts.replacement

  if (reReserved.test(replacement) && reControlChars.test(replacement)) {
    throw new Error(
      'Replacement string cannot contain reserved filename characters',
    )
  }

  let s = filename

  s = s.replace(reReserved, replacement)
  s = s.replace(reControlChars, replacement)
  s = s.replace(reRelativePath, replacement)

  if (replacement.length > 0) {
    s = trimRepeated(s, replacement)
    s = s.length > 1 ? stripOuter(s, replacement) : s
  }

  s = reWindowsNames.test(s) ? s + replacement : s
  s = s.slice(0, opts.maxLength)

  return s
}

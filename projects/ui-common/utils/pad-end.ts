import { createPadding } from './create-padding'

export function padEnd(
  stringToPad: string,
  paddingLength: number | undefined = 0,
  paddingChars: string | undefined = ' '
): string {
  const strLength = paddingLength ? stringToPad.length : 0

  if (!paddingLength || strLength >= paddingLength) {
    return stringToPad
  }

  return stringToPad + createPadding(paddingLength - strLength, paddingChars)
}

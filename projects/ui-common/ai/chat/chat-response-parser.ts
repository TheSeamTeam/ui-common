export type ChatContentSegment =
  | { type: 'markdown'; content: string }
  | { type: 'custom-block'; tag: string; content: string }

/**
 * Splits a raw AI response string into an ordered array of segments.
 * Fenced code blocks with `seam-` prefixed language tags become custom-block
 * segments; everything else stays as markdown.
 */
export function parseChatResponse(input: string): ChatContentSegment[] {
  if (!input) {
    return []
  }

  const segments: ChatContentSegment[] = []
  const pattern = /^```(seam-[\w-]+)\n([\s\S]*?)^```/gm

  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = pattern.exec(input)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        type: 'markdown',
        content: input.slice(lastIndex, match.index),
      })
    }

    segments.push({
      type: 'custom-block',
      tag: match[1],
      content: match[2].replace(/\n$/, ''),
    })

    lastIndex = match.index + match[0].length
  }

  if (lastIndex < input.length) {
    segments.push({ type: 'markdown', content: input.slice(lastIndex) })
  }

  return segments
}

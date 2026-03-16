export type RouteDirection = 'sibling' | 'deeper' | 'shallower'

export function computeDirection(
  prev: string[],
  next: string[],
): RouteDirection {
  let shared = 0
  while (
    shared < prev.length &&
    shared < next.length &&
    prev[shared] === next[shared]
  ) {
    shared++
  }

  const prevRemaining = prev.length - shared
  const nextRemaining = next.length - shared

  if (prevRemaining === 0 && nextRemaining > 0) return 'deeper'
  if (prevRemaining > 0 && nextRemaining === 0) return 'shallower'
  return 'sibling'
}

/** Below this projected diagonal, a shape is too small to label. */
export const DEFAULT_LABEL_MIN_DIAGONAL_PX = 48

/**
 * Whether a group is large enough on screen to carry a label.
 *
 * Uses the diagonal rather than width and height separately, so a long thin
 * field — which has plenty of room for a label — is not hidden for being
 * narrow. This self-tunes as the map zooms out, which is why there is no
 * `minZoom` input.
 */
export function isLabelVisibleAtSize(
  widthPx: number,
  heightPx: number,
  minDiagonalPx: number = DEFAULT_LABEL_MIN_DIAGONAL_PX,
): boolean {
  return Math.hypot(widthPx, heightPx) >= minDiagonalPx
}

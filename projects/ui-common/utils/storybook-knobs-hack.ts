/**
 * Hack for storybook knobs to allow `undefined` and `null` in `select`.
 *
 * NOTE: This feature is being worked on, so this hack shouldn't be needed long.
 */
export function _knobUndefinedNullHACK(v) {
  return v === '__undefined__' ? undefined : v === '__null__' ? null : v
}

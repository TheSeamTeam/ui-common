/**
 * Maps every key of `Src` to `Dst`'s type for that key, **required** but still
 * allowed to be `undefined`.
 *
 * Annotating a hand-written mapping literal with this makes a forgotten field a
 * compile error (TS2741) instead of a silently dropped value. A wholesale
 * spread cannot do that: TypeScript exempts spread properties from
 * excess-property checking, which is how `side` and `align` were once dropped
 * on the session-to-adapter hop.
 *
 * Two details are load-bearing, and both were verified before this was written:
 *
 * - `& string` makes the mapped type non-homomorphic. Written plainly as
 *   `{ [K in keyof Src]-?: Dst[K] | undefined }`, the `-?` strips `undefined`
 *   from the value type as well as the optional marker, so `side: undefined`
 *   would not compile.
 * - The key set comes from `Src` alone, with the conditional supplying the
 *   value type. Keying off `keyof Src & keyof Dst` looks equivalent but is
 *   not: a field added to `Src` and not yet to `Dst` would fall out of the
 *   intersection and be silently exempt — precisely the case this exists to
 *   catch. Here it resolves to `never`, which no value satisfies.
 */
export type ExhaustiveMap<Src, Dst = Src> = {
  [K in keyof Src & string]-?: K extends keyof Dst ? Dst[K] | undefined : never
}

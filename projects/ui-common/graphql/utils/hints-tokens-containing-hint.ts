import { HintsToken } from '../models'

export function hintsTokensContainingHint(hintsTokens: HintsToken[], hint: string): HintsToken[] {
  return hintsTokens.filter(r => r.hints.indexOf(hint) !== -1)
}

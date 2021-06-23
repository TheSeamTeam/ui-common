import { RulesToken } from '../models'

export function rulesTokensContainingRule(rulesTokens: RulesToken[], rule: string): RulesToken[] {
  return rulesTokens.filter(r => r.rules.indexOf(rule) !== -1)
}

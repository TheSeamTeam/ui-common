import { DefinitionNode, DocumentNode, parse, Token } from 'graphql/language'

import { parseComments } from './parse-comments'

const RULE_PREFIX_REGEX = /^\s*@gql-rule:.+/
const RULE_NAMES_CAPTURE_REGEX = /^\s*@gql-rule:([a-zA-z-\d\s]+)$/

/**
 * If AST loc has startToken prop then return same AST else reparse with config
 * to contain comments.
 */
function parseAst(ast: DocumentNode): DocumentNode {
  if (ast.loc === undefined) {
    throw Error(`Expected AST to have loc.`)
  }

  if (ast.loc.startToken !== undefined) {
    return ast
  }

  return parse(ast.loc.source, {
    allowLegacySDLImplementsInterfaces: false,
    experimentalFragmentVariables: true,
  })
}

function isCommentToken(token: Token): boolean {
  return token.kind === 'Comment'
}

function isRuleToken(token: Token): boolean {
  return isCommentToken(token) &&
    (token.value?.match(RULE_PREFIX_REGEX)?.length || 0) > 0 || false
}

function isInlineComment(token: Token): boolean {
  return isCommentToken(token) &&
    token.prev !== null &&
    token.prev.line === token.line
}

function ruleNamesFromRuleToken(token: Token): string[] {
  const grp = token.value?.match(RULE_NAMES_CAPTURE_REGEX)
  if (grp === null || grp === undefined || grp.length === 0) {
    return []
  }
  return grp[1].split(' ').map(x => x.trim()).filter(x => x.length > 0)
}

enum RulesKind {
  Field,
  VariableDefinition,
  Variable,
  Argument
}

function isFieldRule(token: Token): boolean {
  return false
}

function isVariableDefinitionRule(token: Token): boolean {
  return false
}

function isVariableRule(token: Token): boolean {
  return false
}

function isArgumentRule(token: Token): boolean {
  return false
}

const rulesKindMatchers: { kind: RulesKind, matcher: (token: Token) => boolean }[] = [
  { kind: RulesKind.Field, matcher: isFieldRule },
  { kind: RulesKind.VariableDefinition, matcher: isVariableDefinitionRule },
  { kind: RulesKind.Variable, matcher: isVariableRule },
  { kind: RulesKind.Argument, matcher: isArgumentRule }
]

function getRulesKind(token: Token, ast: DocumentNode): RulesKind | null {
  return rulesKindMatchers.find(x => x.matcher(token))?.kind || null
}

export interface RulesToken {
  node: DefinitionNode
  rules: string[]
  kind: RulesKind
}

export function parseRules(ast: DocumentNode): RulesToken[] {
  const _ast = parseAst(ast)

  const comments = parseComments(_ast)
  console.log('comments', comments, _ast)

  const ruleTokens = comments.filter(isRuleToken)
  console.log('ruleTokens', ruleTokens)

  const inlineRuleTokens = ruleTokens.filter(isInlineComment)
  console.log('inlineRuleTokens', inlineRuleTokens)

  for (const r of ruleTokens) {
    console.log('~', r, ruleNamesFromRuleToken(r))
    console.log('~!', getRulesKind(r, ast))
  }

  return []
}

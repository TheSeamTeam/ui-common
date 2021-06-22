import { ArgumentNode, BREAK, DocumentNode, FieldNode, parse, Token, VariableDefinitionNode, VariableNode, visit } from 'graphql'

import { notNullOrUndefined } from '@theseam/ui-common/utils'

import { parseComments } from './parse-comments'

export const RULE_PREFIX_REGEX = /^\s*@gql-rule:.+/
export const RULE_NAMES_CAPTURE_REGEX = /^\s*@gql-rule:([a-zA-z-\d\s]+)$/

/**
 * If AST loc has startToken prop then return same AST else reparse with config
 * to contain comments and loc at each node.
 */
export function parseAst(ast: DocumentNode): DocumentNode {
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

export function isCommentToken(token: Token): boolean {
  return token.kind === 'Comment'
}

export function isRuleToken(token: Token): boolean {
  return isCommentToken(token) &&
    (token.value?.match(RULE_PREFIX_REGEX)?.length || 0) > 0 || false
}

export function isInlineComment(token: Token): boolean {
  return isCommentToken(token) &&
    token.prev !== null &&
    token.prev.line === token.line
}

export function ruleNamesFromRuleToken(token: Token): string[] {
  const grp = token.value?.match(RULE_NAMES_CAPTURE_REGEX)
  if (grp === null || grp === undefined || grp.length === 0) {
    return []
  }
  return grp[1].split(' ').map(x => x.trim()).filter(x => x.length > 0)
}

export function getTokenAppliesTo(token: Token): Token | null {
  if (isInlineComment(token)) {
    return token.prev
  }

  let t = token.next
  if (t?.kind === '$' && t.next?.kind === 'Name') {
    t = t.next
  }
  return t
}

export enum RulesKind {
  Field = 'Field',
  VariableDefinition = 'VariableDefinition',
  Variable = 'Variable',
  Argument = 'Argument'
}

export interface RulesToken {
  node: VariableDefinitionNode | VariableNode | ArgumentNode | FieldNode
  rules: string[]
  kind: RulesKind
}

export function createRulesToken(token: Token, node: RulesToken['node'], kind: RulesKind): RulesToken {
  return {
    node,
    rules: ruleNamesFromRuleToken(token),
    kind
  }
}

export function getRulesToken(token: Token, ast: DocumentNode): RulesToken | null {
  const appliesTo = getTokenAppliesTo(token)
  if (appliesTo === null) {
    return null
  }

  let appliesToNode: RulesToken | null = null
  visit(ast, {
    VariableDefinition(node: VariableDefinitionNode) {
      if (node.variable.name.loc?.start === appliesTo.start) {
        appliesToNode = createRulesToken(token, node, RulesKind.VariableDefinition)
        return BREAK
      }
    },
    Variable(node: VariableNode) {
      if (node.name.loc?.start === appliesTo.start) {
        appliesToNode = createRulesToken(token, node, RulesKind.Variable)
        return BREAK
      }
    },
    Argument(node: ArgumentNode) {
      if (node.name.loc?.start === appliesTo.start) {
        appliesToNode = createRulesToken(token, node, RulesKind.Argument)
        return BREAK
      }
    },
    Field(node: FieldNode) {
      if (node.name.loc?.start === appliesTo.start) {
        appliesToNode = createRulesToken(token, node, RulesKind.Field)
        return BREAK
      }
    }
  })
  return appliesToNode
}

export function parseRules(ast: DocumentNode): RulesToken[] {
  const _ast = parseAst(ast)

  return parseComments(_ast)
    .filter(isRuleToken)
    .map(r => getRulesToken(r, _ast))
    .filter(notNullOrUndefined)
}

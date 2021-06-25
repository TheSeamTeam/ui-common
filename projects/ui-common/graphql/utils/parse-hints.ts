import {
  ArgumentNode,
  BREAK,
  DocumentNode,
  FieldNode,
  OperationDefinitionNode,
  parse,
  Token,
  VariableDefinitionNode,
  VariableNode,
  visit
} from 'graphql'

import { notNullOrUndefined } from '@theseam/ui-common/utils'

import { HintsKind, HintsToken } from '../models'
import { parseComments } from './parse-comments'

export const HINT_PREFIX_REGEX = /^\s*@gql-hint:.+/
export const HINT_NAMES_CAPTURE_REGEX = /^\s*@gql-hint:([a-zA-z-\d\s]+)$/

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

export function isHintToken(token: Token): boolean {
  return isCommentToken(token) &&
    (token.value?.match(HINT_PREFIX_REGEX)?.length || 0) > 0 || false
}

export function isInlineComment(token: Token): boolean {
  return isCommentToken(token) &&
    token.prev !== null &&
    token.prev.line === token.line
}

export function hintNamesFromHintToken(token: Token): string[] {
  const grp = token.value?.match(HINT_NAMES_CAPTURE_REGEX)
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

export function createHintsToken(token: Token, node: HintsToken['node'], kind: HintsKind): HintsToken {
  return {
    node,
    hints: hintNamesFromHintToken(token),
    kind
  }
}

export function getHintsToken(token: Token, ast: DocumentNode): HintsToken | null {
  console.log('getHintsToken', token)
  const appliesTo = getTokenAppliesTo(token)
  if (appliesTo === null) {
    return null
  }

  let appliesToNode: HintsToken | null = null
  visit(ast, {
    OperationDefinition(node: OperationDefinitionNode) {
      if (node.loc?.start === appliesTo.start) {
        appliesToNode = createHintsToken(token, node, HintsKind.OperationDefinition)
        return BREAK
      }
    },
    VariableDefinition(node: VariableDefinitionNode) {
      if (node.variable.name.loc?.start === appliesTo.start) {
        appliesToNode = createHintsToken(token, node, HintsKind.VariableDefinition)
        return BREAK
      }
    },
    Variable(node: VariableNode) {
      if (node.name.loc?.start === appliesTo.start) {
        appliesToNode = createHintsToken(token, node, HintsKind.Variable)
        return BREAK
      }
    },
    Argument(node: ArgumentNode) {
      if (node.name.loc?.start === appliesTo.start) {
        appliesToNode = createHintsToken(token, node, HintsKind.Argument)
        return BREAK
      }
    },
    Field(node: FieldNode) {
      if (node.name.loc?.start === appliesTo.start) {
        appliesToNode = createHintsToken(token, node, HintsKind.Field)
        return BREAK
      }
    }
  })
  return appliesToNode
}

export function parseHints(ast: DocumentNode): HintsToken[] {
  const _ast = parseAst(ast)
  console.log('_ast', _ast)
  return parseComments(_ast)
    .filter(isHintToken)
    .map(r => getHintsToken(r, _ast))
    .filter(notNullOrUndefined)
}

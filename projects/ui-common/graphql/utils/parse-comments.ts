import { DocumentNode, Token } from 'graphql/language'

// Based on Prettier's comment parsing.
//
// Source: https://github.com/prettier/prettier/blob/4e46f92b8648c7f25de62bfaf4368aa3f2e588d9/src/language-graphql/parser-graphql.js#L6
export function parseComments(ast: DocumentNode): Token[] {
  const comments: Token[] = []

  if (ast.loc === undefined) {
    return comments
  }

  const startToken = ast.loc.startToken
  let next = startToken.next
  while (next !== null && next.kind !== '<EOF>') {
    if (next.kind === 'Comment') {
      Object.assign(next, {
        // The Comment token's column starts _after_ the `#`,
        // but we need to make sure the node captures the `#`
        column: next.column - 1
      })
      comments.push(next)
    }
    next = next.next
  }

  return comments
}

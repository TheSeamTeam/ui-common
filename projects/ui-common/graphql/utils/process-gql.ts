import { isNullOrUndefined, withoutProperty } from '@theseam/ui-common/utils'
import { ArgumentNode, DocumentNode, parseValue, visit } from 'graphql'

import { inlineVariableHintDef, removeNotDefinedHintDef } from '../hints'
import { QueryProcessingConfig } from '../models'
import {
  containsVariable,
  hintsTokensContainingHint,
  inlineVariable,
  parseAst,
  parseHints,
  removeVariable,
  removeVariableDefinition,
  toGQL,
} from './'

/**
 * Transforms a GraphQL query and its variables according to the provided
 * processing configuration.
 *
 * Two mechanisms are supported and can be combined freely:
 *
 * **Hint-based** — `# @gql-hint: <name>` comments in the query.
 * - `remove-not-defined`: removes variables whose value is null/undefined.
 * - `inline-variable`: substitutes variable values directly into the AST.
 *
 * **Config-based** — via `QueryProcessingConfig`:
 * - `removeIfNotDefined`: remove named variables when null/undefined.
 * - `removeIfNotUsed`: remove named variable definitions when unreferenced.
 * - `inline`: inline named variables into the query AST.
 * - `orderTiebreaker`: append a fallback sort field for deterministic pagination.
 *
 * Hints are applied first, then config-based processing, then cleanup.
 */
export function processGql(
  query: DocumentNode,
  variables: Record<string, any>,
  queryProcessingConfig: QueryProcessingConfig,
): { query: DocumentNode; variables: Record<string, any> } {
  let _ast = parseAst(query)
  let _variables = { ...variables }

  // ---- Hint: remove-not-defined ------------------------------------------
  const rules = parseHints(_ast)
  for (const hintsToken of hintsTokensContainingHint(
    rules,
    removeNotDefinedHintDef.name,
  )) {
    const result = removeNotDefinedHintDef.transformer!(
      { query: _ast, variables: _variables },
      hintsToken,
    )
    _ast = result.query
    _variables = result.variables
  }

  // ---- Hint: inline-variable ---------------------------------------------
  for (const hintsToken of hintsTokensContainingHint(
    rules,
    inlineVariableHintDef.name,
  )) {
    const result = inlineVariableHintDef.transformer!(
      { query: _ast, variables: _variables },
      hintsToken,
    )
    _ast = result.query
    _variables = result.variables
  }

  // ---- Config: removeIfNotDefined ----------------------------------------
  for (const varName of queryProcessingConfig?.variables?.removeIfNotDefined ??
    []) {
    if (isNullOrUndefined(_variables[varName])) {
      _ast = removeVariable(_ast, varName)
    }
  }

  // ---- Config: removeIfNotUsed -------------------------------------------
  for (const varName of queryProcessingConfig?.variables?.removeIfNotUsed ??
    []) {
    if (!containsVariable(_ast, varName)) {
      _ast = removeVariable(_ast, varName)
    }
  }

  // ---- Config: inline ----------------------------------------------------
  for (const varName of queryProcessingConfig?.variables?.inline ?? []) {
    const varValue = _variables[varName]
    _variables = withoutProperty(_variables, varName)
    _ast = removeVariableDefinition(_ast, varName)
    _ast = inlineVariable(_ast, varName, parseValue(toGQL(varValue)))
  }

  // ---- Config: orderTiebreaker -------------------------------------------
  const orderTiebreaker = queryProcessingConfig?.variables?.orderTiebreaker
  if (typeof orderTiebreaker === 'string' && orderTiebreaker.length > 0) {
    const order = _variables['order']
    if (!isNullOrUndefined(order) && Array.isArray(order)) {
      const idx = order.findIndex(
        (x: Record<string, any>) => x[orderTiebreaker] !== undefined,
      )
      if (idx === -1) {
        _variables['order'] = [...order, { [orderTiebreaker]: 'DESC' }]
      }
    }
  }

  // ---- Cleanup: empty where ----------------------------------------------
  // Targets inlined filter results like `where: { and: [] }` where the
  // datatable's automated filter merging produced an empty array. We
  // intentionally do NOT match deeper nesting (e.g. `where: { status: { in: [] } }`)
  // — an empty condition at that level likely indicates a real bug in the
  // filter code that should surface as an error.
  _ast = visit(_ast, {
    Argument(node: ArgumentNode) {
      if (
        node.name.value === 'where' &&
        (node.value as any)?.fields?.length &&
        (node.value as any)?.fields[0]?.value?.values?.length === 0
      ) {
        return null
      }
    },
  })

  return { query: _ast, variables: _variables }
}


interface WhereItemDef {
  eq?: any | WhereItem
  neq?: any | WhereItem
}

interface WhereItemCollection {
  and?: WhereItem | WhereItem[] | WhereItemField
  or?: WhereItem | WhereItem[] | WhereItemField
}
const _whereItemCollectionKinds: (keyof WhereItemCollection)[] = [ 'and', 'or' ]

interface WhereItemField {
  [field: string]: WhereItemDef
}

type WhereItem = WhereItemCollection | WhereItemField

export type WhereArg = WhereItem

type WhereFieldFn<T = any> = (obj: any) => T
type WhereField<T = any> = WhereFieldFn<T> | T
type WhereConditionFn = (obj: any) => boolean

type WhereConditionOperator = (field1: WhereField, field2: WhereField) => WhereConditionFn
// type WhereConditionCollection = (kind: any, ops: WhereConditionOperator[]) => WhereConditionFn

type WhereCondition = WhereConditionOperator // | WhereConditionCollection

function _createWhereFieldFn(fieldName: string): WhereFieldFn {
  return (obj: any) => obj[fieldName]
}

function _resolveWhereField<T = any>(obj: any, f: WhereField<T>): any {
  if (f instanceof Function) {
    return f(obj)
  }
  return f
}

const _eqConditionOp: WhereConditionOperator = (field1: WhereField, field2: WhereField): WhereConditionFn =>
  (obj: any): boolean => _resolveWhereField(obj, field1) === _resolveWhereField(obj, field2)

const _neqConditionOp: WhereConditionOperator = (field1: WhereField, field2: WhereField): WhereConditionFn =>
  (obj: any): boolean => _resolveWhereField(obj, field1) !== _resolveWhereField(obj, field2)

interface WhereConditionOperatorMap {
  eq: WhereCondition
  neq: WhereCondition
}

const _conditions: WhereConditionOperatorMap = {
  eq: _eqConditionOp,
  neq: _neqConditionOp,
}
const _conditionKinds: (keyof WhereConditionOperatorMap)[] = [ 'eq', 'neq' ]

function _getWhereCondition(x: any): { condition: WhereCondition, value: any } | null {
  for (const k of _conditionKinds) {
    // if (hasProperty(x, k)) {
    if (x[k] !== undefined) {
      return { condition: _conditions[k], value: x[k] }
    }
  }
  return null
}

function _parseWhereItems(where: WhereArg): WhereConditionFn[] {
  const conditions: WhereConditionFn[] = []

  const keys = Object.keys(where)
  if (keys.find(k => _whereItemCollectionKinds.find(k2 => k === k2) !== undefined) !== undefined) {

  } else {
    for (const k of keys as (keyof WhereItemField)[]) {
      const c = _getWhereCondition((where as any)[k])
      if (c === null) {
        throw Error(`Unexpected where item.`)
      }

      conditions.push(c.condition(_createWhereFieldFn(`${k}`), c.value))
    }
  }

  return conditions
}

export function filterWhere<T>(data: T[], where: WhereArg): T[] {
  const items = _parseWhereItems(where)
  const filteredClaims = data.filter(c => {
    // const idx = items.indexOf(itm => itm(c))
    // return idx !== -1

    let found: boolean = false
    for (const itm of items) {
      const b = itm(c)
      if (b) {
        found = b
        break
      }
    }
    return found
  })
  return filteredClaims
}

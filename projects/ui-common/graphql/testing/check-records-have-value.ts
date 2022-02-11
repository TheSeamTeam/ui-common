import { notNullOrUndefined } from '@theseam/ui-common/utils'

export function checkRecordsHaveValue(
  arr: any[] | null,
  indices: (number | [ startIndex: number, endIndex: number ])[],
  testValueCheckProp: string | null = 'name',
  onlyCheckProvidedIndices: boolean = false
): void {
  if (indices.length > 0 && !Array.isArray(arr)) {
    throw Error(`Records array should be defined.`)
  }

  if (!Array.isArray(arr)) {
    return
  }

  for (let i = 0; i < arr.length; i++) {
    const item = arr[i]
    if (_isOneOfIndices(indices, i)) {
      if (!notNullOrUndefined(arr[i])) {
        throw Error(`Record at index '${i}' should be defined.`)
      }
      if (notNullOrUndefined(testValueCheckProp)) {
        const actualValue = item[testValueCheckProp]
        const expectedValue = `Item_${i}`
        if (actualValue !== expectedValue) {
          throw Error(`Record at index '${i}' should be '${expectedValue}', but is '${actualValue}'`)
        }
      }
    } else {
      if (!onlyCheckProvidedIndices) {
        if (notNullOrUndefined(arr[i])) {
          throw Error(`Record at index '${i}' should not be defined.`)
        }
      }
    }
  }
}

/**
 * NOTE: This is a very niave implementation that could be improved.
 */
function _isOneOfIndices(indices: (number | [ startIndex: number, endIndex: number ])[], index: number): boolean {
  for (const r of indices) {
    if (Array.isArray(r)) {
      if (index >= r[0] && index <= r[1]) {
        return true
      }
    } else {
      if (index === r) {
        return true
      }
    }
  }

  return false
}

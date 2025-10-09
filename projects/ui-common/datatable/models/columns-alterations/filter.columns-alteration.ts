import { TableColumnProp } from '@marklb/ngx-datatable'
import { notNullOrUndefined } from '@theseam/ui-common/utils'

import { ColumnsAlteration } from '../columns-alteration'
import { TheSeamDatatableAccessor } from '../datatable-accessor'
import { TheSeamDatatableColumn } from '../table-column'
import {
  TheSeamColumnsDataFilterTextSearchType,
  TheSeamColumnsDataFilterNumericSearchType,
  TheSeamColumnsDataFilterDateSearchType,
} from '../columns-data-filters/models'
import { AlterationDisplayItem } from '../../../datatable-alterations-display/models/alteration-display.model'

export type FilterType = 'text' | 'numeric' | 'date'

export type FilterOperation =
  TheSeamColumnsDataFilterTextSearchType |
  TheSeamColumnsDataFilterNumericSearchType |
  TheSeamColumnsDataFilterDateSearchType

export interface FilterColumnsAlterationState {
  columnProp: TableColumnProp
  filterType: FilterType
  operation: FilterOperation
  value?: any
  fromValue?: any
  toValue?: any
}

export class FilterColumnsAlteration extends ColumnsAlteration<FilterColumnsAlterationState> {
  public readonly id: string

  public readonly type: string = 'filter'

  constructor(
    state: FilterColumnsAlterationState,
    persistent: boolean,
  ) {
    super(state, persistent)

    if (!this._isValidState(state)) {
      throw Error(`Invalid filter alteration state: ${JSON.stringify(state)}`)
    }

    this.id = `${this.type}--${state.columnProp}`
  }

  public apply(columns: TheSeamDatatableColumn<any, any>[], datatable: TheSeamDatatableAccessor): void {
    // Get the columns filters service from the datatable
    const columnsFiltersService = (datatable as any)._columnsFilters
    if (!columnsFiltersService) {
      throw new Error('ColumnsFiltersService not found on datatable')
    }

    // Find the filter for this column
    const filter = columnsFiltersService.getColumnFilter(this.state.columnProp)
    if (!filter) {
      throw new Error(`Filter not found for column: ${this.state.columnProp}`)
    }

    // Apply the filter based on the filter type
    this._applyFilterValues(filter)
  }

  private _applyFilterValues(filter: any): void {
    const { operation, value, fromValue, toValue } = this.state

    // Create the form values based on the operation type
    const formValues: any = {
      searchType: operation,
      searchText: null,
      fromText: null,
      toText: null,
    }

    // Set values based on operation type
    if (this._isRangeOperation(operation)) {
      if (!notNullOrUndefined(fromValue) || !notNullOrUndefined(toValue)) {
        throw new Error(`Range operation '${operation}' requires both fromValue and toValue`)
      }
      formValues.fromText = String(fromValue)
      formValues.toText = String(toValue)
    } else if (this._isValueOperation(operation)) {
      if (!notNullOrUndefined(value)) {
        throw new Error(`Operation '${operation}' requires a value`)
      }
      formValues.searchText = String(value)
    }
    // For 'blank' and 'not-blank' operations, no additional values are needed

    // Apply the values to the filter form
    filter.form.patchValue(formValues)
  }

  public toDisplayItem(): AlterationDisplayItem {
    const summary = this._createFilterSummary()
    const details = this._createFilterDetails()

    return {
      id: this.id,
      type: this.type,
      summary,
      details,
      sortOrder: this._getColumnSortOrder(),
    }
  }

  public getDisplaySortOrder(): number {
    return this._getColumnSortOrder()
  }

  private _isRangeOperation(operation: FilterOperation): boolean {
    return operation === 'between' || operation === 'not-between'
  }

  private _isValueOperation(operation: FilterOperation): boolean {
    const valueOperations: FilterOperation[] = [
      'contains', 'ncontains', 'eq', 'neq', // text
      'gt', 'lt', 'gte', 'lte', // numeric/date
    ]
    return valueOperations.includes(operation)
  }

  private _isValidState(state: FilterColumnsAlterationState): boolean {
    // Check required fields
    if (!notNullOrUndefined(state.columnProp)) {
      return false
    }

    if (!notNullOrUndefined(state.filterType)) {
      return false
    }

    if (!notNullOrUndefined(state.operation)) {
      return false
    }

    // Validate operation is valid for filter type
    if (!this._isValidOperationForFilterType(state.operation, state.filterType)) {
      throw new Error(`Operation '${state.operation}' is not valid for filter type '${state.filterType}'`)
    }

    // Validate required values for operations
    if (this._isRangeOperation(state.operation)) {
      if (!notNullOrUndefined(state.fromValue) || !notNullOrUndefined(state.toValue)) {
        throw new Error(`Range operation '${state.operation}' requires both fromValue and toValue`)
      }
    } else if (this._isValueOperation(state.operation)) {
      if (!notNullOrUndefined(state.value)) {
        throw new Error(`Operation '${state.operation}' requires a value`)
      }
    }

    return true
  }

  private _isValidOperationForFilterType(operation: FilterOperation, filterType: FilterType): boolean {
    const textOperations: FilterOperation[] = ['contains', 'ncontains', 'eq', 'neq', 'blank', 'not-blank']
    const numericOperations: FilterOperation[] = ['gt', 'lt', 'eq', 'gte', 'lte', 'blank', 'not-blank', 'between', 'not-between']
    const dateOperations: FilterOperation[] = ['lt', 'lte', 'gt', 'gte', 'eq', 'blank', 'not-blank', 'between', 'not-between']

    switch (filterType) {
      case 'text':
        return textOperations.includes(operation)
      case 'numeric':
        return numericOperations.includes(operation)
      case 'date':
        return dateOperations.includes(operation)
      default:
        return false
    }
  }

  private _createFilterSummary(): string {
    const { columnProp, operation, value, fromValue, toValue } = this.state

    if (this._isRangeOperation(operation)) {
      return `${columnProp}: ${fromValue} to ${toValue}`
    } else if (this._isValueOperation(operation)) {
      return `${columnProp} ${this._getOperationSymbol(operation)} ${value}`
    } else {
      // blank or not-blank operations
      const operationText = operation === 'blank' ? 'is empty' : 'is not empty'
      return `${columnProp} ${operationText}`
    }
  }

  private _createFilterDetails(): string[] {
    const { columnProp, filterType, operation, value, fromValue, toValue } = this.state
    const details = [
      `Column: ${columnProp}`,
      `Type: ${filterType}`,
      `Operation: ${this._getOperationDisplayName(operation)}`,
    ]

    if (this._isRangeOperation(operation)) {
      details.push(`From: ${fromValue}`)
      details.push(`To: ${toValue}`)
    } else if (this._isValueOperation(operation)) {
      details.push(`Value: ${value}`)
    }

    return details
  }

  private _getOperationSymbol(operation: FilterOperation): string {
    const symbols: Record<string, string> = {
      'contains': 'contains',
      'ncontains': 'does not contain',
      'eq': '=',
      'neq': '≠',
      'gt': '>',
      'lt': '<',
      'gte': '≥',
      'lte': '≤',
    }
    return symbols[operation] || operation
  }

  private _getOperationDisplayName(operation: FilterOperation): string {
    const names: Record<string, string> = {
      'contains': 'Contains',
      'ncontains': 'Does not contain',
      'eq': 'Equals',
      'neq': 'Not equals',
      'gt': 'Greater than',
      'lt': 'Less than',
      'gte': 'Greater than or equal',
      'lte': 'Less than or equal',
      'blank': 'Is blank',
      'not-blank': 'Is not blank',
      'between': 'Between',
      'not-between': 'Not between',
    }
    return names[operation] || operation
  }

  private _getColumnSortOrder(): number {
    // Sort by column name for consistent ordering
    return String(this.state.columnProp).charCodeAt(0)
  }
}

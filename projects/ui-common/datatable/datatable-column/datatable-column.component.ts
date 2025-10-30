import {
  Component,
  ContentChild,
  Input,
  OnChanges,
  PipeTransform,
  SimpleChanges,
  TemplateRef,
} from '@angular/core'

import { TableColumnProp } from '@marklb/ngx-datatable'

import { DatatableCellTplDirective } from '../directives/datatable-cell-tpl.directive'
import { DatatableColumnChangesService } from '../services/datatable-column-changes.service'

// HACK: Union type prevents the not found warning
type _PipeTransform = PipeTransform | PipeTransform

// TODO: The column component should implement `ITheSeamDatatableColumn`, since
// providing some properties by input and some by template could be confusing.

@Component({
  selector: 'seam-datatable-column',
  templateUrl: './datatable-column.component.html',
  styleUrls: ['./datatable-column.component.scss'],
  standalone: false,
})
export class DatatableColumnComponent implements OnChanges {
  @Input() name?: string | null
  @Input() prop?: TableColumnProp | null

  @Input() flexGrow?: number | null
  @Input() minWidth?: number | null
  @Input() maxWidth?: number | null
  @Input() width?: number | null

  @Input() resizeable?: boolean | null
  @Input() sortable?: boolean | null
  @Input() draggable?: boolean | null

  @Input() canAutoResize?: boolean | null

  @Input() comparator?:
    | ((
        valueA: any,
        valueB: any,
        rowA?: any,
        rowB?: any,
        sortDirection?: 'asc' | 'desc',
      ) => -1 | 0 | 1)
    | null

  @Input() headerTemplate?: TemplateRef<any> | null

  @Input() checkboxable?: boolean | null
  @Input() headerCheckboxable?: boolean | null

  @Input() headerClass?: string | ((data: any) => string | any) | null
  @Input() cellClass?: string | ((data: any) => string | any) | null

  @Input() frozenLeft?: boolean | null
  @Input() frozenRight?: boolean | null

  @Input() pipe?: _PipeTransform | null

  @Input() isTreeColumn?: boolean | null
  @Input() treeLevelIndent?: number | null

  @Input() summaryFunc?: ((cells: any[]) => any) | null
  @Input() summaryTemplate?: TemplateRef<any> | null

  @Input() hidden?: boolean | null

  @Input() align?: 'left' | 'center' | 'right' | null
  @Input() alignHeader?: 'left' | 'center' | 'right' | null
  @Input() alignCell?: 'left' | 'center' | 'right' | null

  private _isFirstChange = true

  @ContentChild(DatatableCellTplDirective, { static: true })
  cellTplDirective?: DatatableCellTplDirective

  // eslint-disable-next-line @angular-eslint/no-input-rename
  @Input('cellTemplate')
  _cellTemplateInput?: TemplateRef<any> | null

  @ContentChild(DatatableCellTplDirective, { read: TemplateRef, static: true })
  _cellTemplateQuery?: TemplateRef<any>

  get cellTemplate(): TemplateRef<any> | undefined | null {
    return this._cellTemplateInput || this._cellTemplateQuery
  }

  // @Input('headerTemplate')
  // _headerTemplateInput: TemplateRef<any>;

  // @ContentChild(DataTableColumnHeaderDirective, { read: TemplateRef, static: true })
  // _headerTemplateQuery: TemplateRef<any>;

  // get headerTemplate(): TemplateRef<any> {
  //   return this._headerTemplateInput || this._headerTemplateQuery;
  // }

  // @Input('treeToggleTemplate')
  // _treeToggleTemplateInput: TemplateRef<any>;

  // @ContentChild(DataTableColumnCellTreeToggle, { read: TemplateRef, static: true })
  // _treeToggleTemplateQuery: TemplateRef<any>;

  // get treeToggleTemplate(): TemplateRef<any> {
  //   return this._treeToggleTemplateInput || this._treeToggleTemplateQuery;
  // }

  readonly __propsChanged: string[] = []

  constructor(private _columnChangesService: DatatableColumnChangesService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (this._isFirstChange) {
      this._isFirstChange = false
    } else {
      this._columnChangesService.onInputChange()
    }

    for (const propName in changes) {
      if (Object.prototype.hasOwnProperty.call(changes, propName)) {
        if (!this.__propsChanged.includes(propName)) {
          this.__propsChanged.push(propName)
        }
      }
    }
  }

  public getCellDirective(): DatatableCellTplDirective | null {
    if (this.cellTplDirective) {
      return this.cellTplDirective
    }

    return null
  }
}

/**
 * Check if a column is bound to a property.
 *
 * This is not guaranteed to be 100% accurate in all cases, but Angular seems
 * to now define properties on the instance for all inputs. So, just relying
 * on defined properties determine if bound will not work. The workaround is
 * to track changes in `ngOnChanges` and use that to determine if a property
 * is bound.
 *
 * NOTE: This is not an instance method, because the way we are handling the
 * instance was causing the method to not be available where needed.
 *
 * @param column the column to check
 * @param propName name of an input property
 * @returns true if the property is bound, false otherwise
 */
export function isColumnBoundToProp(
  column: DatatableColumnComponent,
  propName: string,
): boolean {
  return column.__propsChanged.includes(propName)
}

import {
  Meta,
  StoryObj,
  componentWrapperDecorator,
  moduleMetadata,
  applicationConfig,
} from '@storybook/angular'

import { Component, Input, ViewChild } from '@angular/core'
import { provideAnimations } from '@angular/platform-browser/animations'
import { BehaviorSubject, Observable, of } from 'rxjs'
import { shareReplay } from 'rxjs/operators'

import {
  DataFilterState,
  TheSeamDataFiltersModule,
} from '@theseam/ui-common/data-filters'
import {
  createSortsMapper,
  DEFAULT_PAGE_SIZE,
  DatatableGraphQLQueryRef,
  DatatableGraphqlService,
  FilterStateMapperResult,
  MapperContext,
  gqlVar,
  observeRowsWithGqlInputsHandling,
} from '@theseam/ui-common/graphql'
import { TheSeamTableCellTypesModule } from '@theseam/ui-common/table-cell-types'

import {
  SimpleGqlTestExtraVariables,
  SimpleGqlTestRecord,
  createMockApolloTestingProvider,
  createSimpleGqlTestRoot,
} from './testing'
import {
  TheSeamDatatableModule,
  DatatableComponent,
} from '@theseam/ui-common/datatable'
import { gql } from 'apollo-angular'

const meta: Meta = {
  title: 'GraphQL',
  decorators: [
    applicationConfig({
      providers: [provideAnimations()],
    }),
  ],
  parameters: {
    layout: 'fullscreen',
    docs: {
      iframeHeight: '400px',
    },
  },
}

export default meta
type Story = StoryObj

const SIMPLE_GQL_BUG_QUERY = gql`
  query ExampleQuery(
    $skip: Int
    $take: Int
    $order: [SimpleGqlTestRecordSortInput!]
    $where: SimpleGqlTestRecordFilterInput
    $fixedFilters: String!
    $search: String!
  ) {
    simpleGqlTestRecords(
      skip: $skip
      take: $take
      order: $order
      where: { and: [$fixedFilters, $where] }
    ) {
      items {
        id
        name
      }
      totalCount
    }
  }
`

@Component({
  selector: 'dt-gql-wrap',
  template: `
    <seam-datatable
      class="w-100 h-100"
      [loadingIndicator]="loading$ | async"
      [columns]="columns"
      [rows]="_rows$ | async"
      externalSorting="true"
      externalFiltering="true"
    >
      <seam-datatable-menu-bar>
        <seam-datatable-menu-bar-row class="pb-2">
          <seam-datatable-menu-bar-column-left></seam-datatable-menu-bar-column-left>
          <seam-datatable-menu-bar-column-center></seam-datatable-menu-bar-column-center>
          <seam-datatable-menu-bar-column-right>
            <seam-data-filter-search
              seamDatatableFilter
            ></seam-data-filter-search>
          </seam-datatable-menu-bar-column-right>
        </seam-datatable-menu-bar-row>

        <seam-datatable-menu-bar-row>
          <seam-datatable-menu-bar-column-left></seam-datatable-menu-bar-column-left>
          <seam-datatable-menu-bar-column-center></seam-datatable-menu-bar-column-center>
          <seam-datatable-menu-bar-column-right></seam-datatable-menu-bar-column-right>
        </seam-datatable-menu-bar-row>
      </seam-datatable-menu-bar>
    </seam-datatable>
  `,
  standalone: false,
})
class GqlDatatableWrapperComponent {
  @Input() columns: any[] = []

  public readonly _rows$: Observable<any[]>
  public readonly loading$: Observable<boolean>

  private readonly _datatableSubject = new BehaviorSubject<any>(undefined)

  @ViewChild(DatatableComponent, { static: true })
  set _datatableQuery(dt: DatatableComponent) {
    this._datatableSubject.next(dt)
  }

  private readonly _queryRef: DatatableGraphQLQueryRef<any, any, any>

  _defaultFilter = ''

  constructor(private readonly _datatableGql: DatatableGraphqlService) {
    this._queryRef = this._datatableGql.watchQuery<any, any, any>(
      {
        query: SIMPLE_GQL_BUG_QUERY,
        variables: { skip: 0, take: DEFAULT_PAGE_SIZE },
      },
      {
        variables: {
          removeIfNotDefined: ['order', 'search', 'fixedFilters'],
          removeIfNotUsed: ['search', 'fixedFilters', 'where'],
          inline: ['where', 'fixedFilters'],
        },
      },
    )

    this.loading$ = this._queryRef.loading$

    const extraVariables$ = of({
      // fixedFilters: { id: { eq: 2 } },
    })

    const _rows$ = this._queryRef
      .rows((data: any) => ({
        rows: data.simpleGqlTestRecords.items,
        totalCount: data.simpleGqlTestRecords.totalCount,
      }))
      .pipe(shareReplay({ bufferSize: 1, refCount: true }))

    const _mapSorts = createSortsMapper<SimpleGqlTestRecord>({})

    const _mapSearchFilterState = (
      filterState: DataFilterState,
      _context: MapperContext<SimpleGqlTestExtraVariables>,
    ): FilterStateMapperResult => {
      const value = filterState.state?.value?.trim()
      if (typeof value !== 'string' || value.length === 0) {
        return null
      }
      const searchVar = gqlVar('search')
      return {
        filter: {
          or: [
            { id: { objectContains: searchVar } },
            { name: { contains: searchVar } },
          ],
        },
        variables: { search: value },
      }
    }

    this._rows$ = observeRowsWithGqlInputsHandling(
      this._queryRef,
      _rows$,
      this._datatableSubject.asObservable(),
      extraVariables$,
      _mapSorts,
      {
        search: _mapSearchFilterState,
      },
    )
  }
}

export const NoFilterNoFixed: Story = {
  decorators: [
    moduleMetadata({
      imports: [TheSeamDatatableModule, TheSeamTableCellTypesModule],
    }),
    componentWrapperDecorator(
      (story) => `<div class="vh-100 vw-100">${story}</div>`,
    ),
  ],
  render: (args) => ({
    component: DatatableComponent,
    applicationConfig: {
      providers: [
        createMockApolloTestingProvider({
          resolve: (operation) => {
            const root = createSimpleGqlTestRoot(600)
            return {
              data: {
                simpleGqlTestRecords: root.simpleGqlTestRecords(
                  operation.variables,
                ),
              },
            }
          },
          delay: 1000,
          logQueryLink: true,
        }),
      ],
    },
    moduleMetadata: {
      declarations: [GqlDatatableWrapperComponent],
      imports: [TheSeamDataFiltersModule],
    },
    props: {
      columns: args.columns,
    },
    template: `<dt-gql-wrap [columns]="columns"></dt-gql-wrap>`,
  }),
  args: {
    columns: [
      { prop: 'id', name: 'Id' },
      { prop: 'name', name: 'Name' },
    ],
  },
}

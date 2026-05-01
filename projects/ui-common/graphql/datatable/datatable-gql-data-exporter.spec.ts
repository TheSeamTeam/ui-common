import { Observable, of } from 'rxjs'

import { faFileCsv } from '@fortawesome/free-solid-svg-icons'
import { gql } from 'apollo-angular'

import {
  DatatableExportPayload,
  DatatableExportTransport,
} from './datatable-export-transport'
import { DatatableGqlDataExporter } from './datatable-gql-data-exporter'

// Mock file-saver so saveAs does not attempt browser APIs in jsdom.
jest.mock('file-saver', () => ({
  default: { saveAs: jest.fn() },
  saveAs: jest.fn(),
}))

// Minimal mock of DatatableGraphQLQueryRef — only the methods the exporter uses.
function createMockQueryRef(options: {
  query: any
  variables: Record<string, any>
  queryProcessingConfig?: any
}) {
  return {
    getVariables: () => options.variables,
    getOptions: () => ({
      query: options.query,
      context: {
        queryProcessingConfig: options.queryProcessingConfig ?? {
          variables: {},
        },
      },
    }),
    getQueryProcessingConfig: () =>
      options.queryProcessingConfig ?? { variables: {} },
  } as any
}

class MockTransport extends DatatableExportTransport {
  public lastPayload: DatatableExportPayload | undefined

  export(data: DatatableExportPayload): Observable<File> {
    this.lastPayload = data
    return of(new File(['test-content'], 'Export.csv', { type: 'text/csv' }))
  }
}

describe('DatatableGqlDataExporter', () => {
  let transport: MockTransport

  beforeEach(() => {
    transport = new MockTransport()
  })

  it('has the correct name, label, and icon', () => {
    const exporter = new DatatableGqlDataExporter(
      'exporter:gql-csv',
      'CSV',
      [],
      createMockQueryRef({
        query: gql`
          query Test {
            items {
              id
            }
          }
        `,
        variables: {},
      }),
      transport,
      'csv',
    )
    expect(exporter.name).toBe('exporter:gql-csv')
    expect(exporter.label).toBe('CSV')
    expect(exporter.icon).toBe(faFileCsv)
    expect(exporter.skipDataMapping).toBe(true)
  })

  it('calls transport with processed query payload', (done) => {
    const query = gql`
      query ItemsQuery($skip: Int, $take: Int) {
        items(skip: $skip, take: $take) {
          id
          name
        }
      }
    `
    const columns = [
      { prop: 'id', name: 'ID' },
      { prop: 'name', name: 'Name' },
    ] as any[]

    const exporter = new DatatableGqlDataExporter(
      'exporter:gql-csv',
      'CSV',
      columns,
      createMockQueryRef({
        query,
        variables: { skip: 0, take: 25 },
      }),
      transport,
      'csv',
    )

    exporter.export([]).subscribe((result) => {
      expect(result).toBe(true)
      expect(transport.lastPayload).toBeDefined()
      expect(transport.lastPayload!.exportType).toBe('csv')
      expect(transport.lastPayload!.graphQlQuery.operationName).toBe(
        'ItemsQuery',
      )
      expect(transport.lastPayload!.graphQlQuery.columns).toBe(columns)
      expect(transport.lastPayload!.graphQlQuery.queryVariables).toEqual({
        skip: 0,
        take: 25,
      })
      done()
    })
  })

  it('applies queryProcessingConfig before building payload', (done) => {
    const query = gql`
      query ItemsQuery($skip: Int, $where: String) {
        items(skip: $skip, where: $where) {
          id
        }
      }
    `
    const exporter = new DatatableGqlDataExporter(
      'exporter:gql-csv',
      'CSV',
      [],
      createMockQueryRef({
        query,
        variables: { skip: 0, where: undefined },
        queryProcessingConfig: {
          variables: { removeIfNotDefined: ['where'] },
        },
      }),
      transport,
      'csv',
    )

    exporter.export([]).subscribe(() => {
      // The where argument and variable definition should have been removed
      expect(transport.lastPayload!.graphQlQuery.queryString).not.toContain(
        'where',
      )
      done()
    })
  })

  it('returns false on transport error', (done) => {
    const errorTransport = {
      export: () =>
        new Observable<File>((subscriber) =>
          subscriber.error(new Error('Network error')),
        ),
    } as DatatableExportTransport

    const exporter = new DatatableGqlDataExporter(
      'exporter:gql-csv',
      'CSV',
      [],
      createMockQueryRef({
        query: gql`
          query Test {
            items {
              id
            }
          }
        `,
        variables: {},
      }),
      errorTransport,
      'csv',
    )

    exporter.export([]).subscribe((result) => {
      expect(result).toBe(false)
      done()
    })
  })
})

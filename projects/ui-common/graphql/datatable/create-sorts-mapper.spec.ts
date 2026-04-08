import { createSortsMapper } from './create-sorts-mapper'
import { MapperContext } from './mapper-context'
import { TheSeamDatatableColumn } from '@theseam/ui-common/datatable'

interface TestRow {
  id: string
  name: string
  status: string
  computed: string
}

function makeContext(
  columns?: Partial<TheSeamDatatableColumn>[],
): MapperContext {
  return {
    extraVariables: {},
    ...(columns ? { columns: columns as TheSeamDatatableColumn[] } : {}),
  }
}

function makeSorts(...props: { prop: string; dir: 'asc' | 'desc' }[]) {
  return props.map((p) => ({ prop: p.prop, dir: p.dir }))
}

describe('createSortsMapper', () => {
  describe('with autoMap (default)', () => {
    it('should identity-map a prop that exists as a sortable column', () => {
      const mapper = createSortsMapper<TestRow>({})
      const context = makeContext([{ prop: 'id', sortable: true }])
      const result = mapper(makeSorts({ prop: 'id', dir: 'asc' }), context)
      expect(result).toEqual([{ id: 'ASC' }])
    })

    it('should identity-map a prop when sortable is undefined (default sortable)', () => {
      const mapper = createSortsMapper<TestRow>({})
      const context = makeContext([{ prop: 'name' }])
      const result = mapper(makeSorts({ prop: 'name', dir: 'desc' }), context)
      expect(result).toEqual([{ name: 'DESC' }])
    })

    it('should skip a prop when sortable is explicitly false', () => {
      const mapper = createSortsMapper<TestRow>({})
      const context = makeContext([{ prop: 'status', sortable: false }])
      const result = mapper(makeSorts({ prop: 'status', dir: 'asc' }), context)
      expect(result).toEqual([])
    })

    it('should skip a prop when the column does not exist (stale preference)', () => {
      const mapper = createSortsMapper<TestRow>({})
      const context = makeContext([{ prop: 'id' }])
      const result = mapper(makeSorts({ prop: 'name', dir: 'asc' }), context)
      expect(result).toEqual([])
    })

    it('should use fieldMap override instead of identity mapping', () => {
      const mapper = createSortsMapper<TestRow>({
        computed: 'gql_computed_field',
      })
      const context = makeContext([{ prop: 'id' }, { prop: 'computed' }])
      const result = mapper(
        makeSorts(
          { prop: 'id', dir: 'asc' },
          { prop: 'computed', dir: 'desc' },
        ),
        context,
      )
      expect(result).toEqual([{ id: 'ASC' }, { gql_computed_field: 'DESC' }])
    })

    it('should drop a prop when fieldMap entry is null', () => {
      const mapper = createSortsMapper<TestRow>({
        status: null,
      })
      const context = makeContext([{ prop: 'status' }])
      const result = mapper(makeSorts({ prop: 'status', dir: 'asc' }), context)
      expect(result).toEqual([])
    })

    it('should call function entries with prop and context', () => {
      const mapper = createSortsMapper<TestRow>({
        computed: (prop, ctx) =>
          ctx.extraVariables.useAlt ? 'alt_field' : prop,
      })
      const context: MapperContext = {
        extraVariables: { useAlt: true },
        columns: [{ prop: 'computed' } as TheSeamDatatableColumn],
      }
      const result = mapper(
        makeSorts({ prop: 'computed', dir: 'asc' }),
        context,
      )
      expect(result).toEqual([{ alt_field: 'ASC' }])
    })

    it('should silently skip when no columns in context', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation()
      try {
        const mapper = createSortsMapper<TestRow>({})
        const context = makeContext() // no columns
        const result = mapper(makeSorts({ prop: 'id', dir: 'asc' }), context)
        expect(result).toEqual([])
      } finally {
        warnSpy.mockRestore()
      }
    })

    it('should handle multiple sorts preserving order', () => {
      const mapper = createSortsMapper<TestRow>({})
      const context = makeContext([
        { prop: 'id' },
        { prop: 'name' },
        { prop: 'status' },
      ])
      const result = mapper(
        makeSorts({ prop: 'name', dir: 'desc' }, { prop: 'id', dir: 'asc' }),
        context,
      )
      expect(result).toEqual([{ name: 'DESC' }, { id: 'ASC' }])
    })
  })

  describe('with autoMap: false', () => {
    it('should map props listed in fieldMap', () => {
      const mapper = createSortsMapper<TestRow>(
        { id: 'id', name: 'userName' },
        { autoMap: false },
      )
      const context = makeContext([{ prop: 'id' }, { prop: 'name' }])
      const result = mapper(
        makeSorts({ prop: 'id', dir: 'asc' }, { prop: 'name', dir: 'desc' }),
        context,
      )
      expect(result).toEqual([{ id: 'ASC' }, { userName: 'DESC' }])
    })

    it('should throw in dev mode for props not in fieldMap', () => {
      const mapper = createSortsMapper<TestRow>(
        { id: 'id' },
        { autoMap: false },
      )
      const context = makeContext([{ prop: 'id' }, { prop: 'name' }])
      expect(() =>
        mapper(
          makeSorts({ prop: 'id', dir: 'asc' }, { prop: 'name', dir: 'desc' }),
          context,
        ),
      ).toThrow(/no mapping found for column prop "name"/)
    })
  })
})

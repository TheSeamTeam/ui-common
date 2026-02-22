import { filterWhere } from './filter-where'

interface TestRecord {
  id: number
  name: string
  score: number
  active: boolean
  tag: string | null
}

function record(
  overrides: Partial<TestRecord> & Pick<TestRecord, 'id'>,
): TestRecord {
  return {
    name: `Item_${overrides.id}`,
    score: overrides.id * 10,
    active: true,
    tag: null,
    ...overrides,
  }
}

const RECORDS: TestRecord[] = [
  record({ id: 1, name: 'Apple', score: 10, active: true, tag: 'fruit' }),
  record({ id: 2, name: 'Banana', score: 20, active: true, tag: 'fruit' }),
  record({ id: 3, name: 'Carrot', score: 30, active: false, tag: 'vegetable' }),
  record({ id: 4, name: 'Date', score: 40, active: true, tag: 'fruit' }),
  record({
    id: 5,
    name: 'Eggplant',
    score: 50,
    active: false,
    tag: 'vegetable',
  }),
]

describe('filterWhere', () => {
  describe('eq / neq', () => {
    it('should filter by eq on a number field', () => {
      const result = filterWhere(RECORDS, { id: { eq: 3 } })
      expect(result.map((r) => r.id)).toEqual([3])
    })

    it('should filter by eq on a string field', () => {
      const result = filterWhere(RECORDS, { name: { eq: 'Banana' } })
      expect(result.map((r) => r.id)).toEqual([2])
    })

    it('should filter by eq on a boolean field', () => {
      const result = filterWhere(RECORDS, { active: { eq: false } })
      expect(result.map((r) => r.id)).toEqual([3, 5])
    })

    it('should return empty array when eq matches nothing', () => {
      const result = filterWhere(RECORDS, { id: { eq: 99 } })
      expect(result).toEqual([])
    })

    it('should filter by neq on a number field', () => {
      const result = filterWhere(RECORDS, { id: { neq: 3 } })
      expect(result.map((r) => r.id)).toEqual([1, 2, 4, 5])
    })

    it('should filter by neq on a string field', () => {
      const result = filterWhere(RECORDS, { tag: { neq: 'fruit' } })
      expect(result.map((r) => r.id)).toEqual([3, 5])
    })
  })

  describe('comparison operators (gt, gte, lt, lte)', () => {
    it('gt should return records where field > value', () => {
      const result = filterWhere(RECORDS, { score: { gt: 30 } })
      expect(result.map((r) => r.id)).toEqual([4, 5])
    })

    it('gte should return records where field >= value', () => {
      const result = filterWhere(RECORDS, { score: { gte: 30 } })
      expect(result.map((r) => r.id)).toEqual([3, 4, 5])
    })

    it('lt should return records where field < value', () => {
      const result = filterWhere(RECORDS, { score: { lt: 30 } })
      expect(result.map((r) => r.id)).toEqual([1, 2])
    })

    it('lte should return records where field <= value', () => {
      const result = filterWhere(RECORDS, { score: { lte: 30 } })
      expect(result.map((r) => r.id)).toEqual([1, 2, 3])
    })
  })

  describe('negated comparison operators (ngt, ngte, nlt, nlte)', () => {
    it('ngt should be equivalent to lte', () => {
      const ngt = filterWhere(RECORDS, { score: { ngt: 30 } }).map((r) => r.id)
      const lte = filterWhere(RECORDS, { score: { lte: 30 } }).map((r) => r.id)
      expect(ngt).toEqual(lte)
    })

    it('ngte should be equivalent to lt', () => {
      const ngte = filterWhere(RECORDS, { score: { ngte: 30 } }).map(
        (r) => r.id,
      )
      const lt = filterWhere(RECORDS, { score: { lt: 30 } }).map((r) => r.id)
      expect(ngte).toEqual(lt)
    })

    it('nlt should be equivalent to gte', () => {
      const nlt = filterWhere(RECORDS, { score: { nlt: 30 } }).map((r) => r.id)
      const gte = filterWhere(RECORDS, { score: { gte: 30 } }).map((r) => r.id)
      expect(nlt).toEqual(gte)
    })

    it('nlte should be equivalent to gt', () => {
      const nlte = filterWhere(RECORDS, { score: { nlte: 30 } }).map(
        (r) => r.id,
      )
      const gt = filterWhere(RECORDS, { score: { gt: 30 } }).map((r) => r.id)
      expect(nlte).toEqual(gt)
    })
  })

  describe('in / nin', () => {
    it('in should return records whose field value is in the array', () => {
      const result = filterWhere(RECORDS, { id: { in: [1, 3, 5] } })
      expect(result.map((r) => r.id)).toEqual([1, 3, 5])
    })

    it('nin should return records whose field value is not in the array', () => {
      const result = filterWhere(RECORDS, { id: { nin: [1, 3, 5] } })
      expect(result.map((r) => r.id)).toEqual([2, 4])
    })

    it('in with empty array should return no records', () => {
      const result = filterWhere(RECORDS, { id: { in: [] } })
      expect(result).toEqual([])
    })
  })

  describe('string operators (contains, startsWith, endsWith)', () => {
    it('contains should match substrings', () => {
      const result = filterWhere(RECORDS, { name: { contains: 'an' } })
      // 'Banana' (B-an-ana) and 'Eggplant' (Eggl-an-t) both contain 'an'
      expect(result.map((r) => r.name)).toEqual(['Banana', 'Eggplant'])
    })

    it('ncontains should exclude substrings', () => {
      const result = filterWhere(RECORDS, { name: { ncontains: 'a' } })
      // Only 'Apple' has no lowercase 'a'; Carrot, Date, Banana, Eggplant all do
      expect(result.map((r) => r.name)).toEqual(['Apple'])
    })

    it('startsWith should match prefix', () => {
      const result = filterWhere(RECORDS, { name: { startsWith: 'Ca' } })
      expect(result.map((r) => r.name)).toEqual(['Carrot'])
    })

    it('nstartsWith should exclude prefix', () => {
      const result = filterWhere(RECORDS, { name: { nstartsWith: 'A' } })
      expect(result.map((r) => r.id)).toEqual([2, 3, 4, 5])
    })

    it('endsWith should match suffix', () => {
      const result = filterWhere(RECORDS, { name: { endsWith: 'e' } })
      // Both 'Apple' and 'Date' end with 'e'
      expect(result.map((r) => r.name)).toEqual(['Apple', 'Date'])
    })

    it('nendsWith should exclude suffix', () => {
      const result = filterWhere(RECORDS, { name: { nendsWith: 't' } })
      // 'Carrot' and 'Eggplant' end with 't'; Apple(1), Banana(2), Date(4) do not
      expect(result.map((r) => r.id)).toEqual([1, 2, 4])
    })

    it('contains is case-sensitive', () => {
      const result = filterWhere(RECORDS, { name: { contains: 'apple' } })
      expect(result).toEqual([])
    })
  })

  describe('objectContains', () => {
    it('should match string fields case-insensitively', () => {
      const result = filterWhere(RECORDS, { name: { objectContains: 'apple' } })
      expect(result.map((r) => r.name)).toEqual(['Apple'])
    })

    it('should convert numeric fields to string for matching', () => {
      const result = filterWhere(RECORDS, { score: { objectContains: '3' } })
      // score 30 contains "3", score 3X would too but we only have 30
      expect(result.map((r) => r.id)).toEqual([3])
    })

    it('should match numeric field with partial string', () => {
      const result = filterWhere(RECORDS, { id: { objectContains: '1' } })
      expect(result.map((r) => r.id)).toEqual([1])
    })

    it('should return empty for null field with non-empty operand', () => {
      const result = filterWhere(RECORDS, { tag: { objectContains: 'xyz' } })
      // tag is 'fruit', 'fruit', 'vegetable', 'fruit', 'vegetable' — none contain 'xyz'
      expect(result).toEqual([])
    })
  })

  describe('implicit AND across multiple field conditions', () => {
    it('should AND two field conditions', () => {
      const result = filterWhere(RECORDS, {
        active: { eq: true },
        tag: { eq: 'fruit' },
      })
      expect(result.map((r) => r.id)).toEqual([1, 2, 4])
    })

    it('should AND three field conditions', () => {
      const result = filterWhere(RECORDS, {
        active: { eq: true },
        tag: { eq: 'fruit' },
        score: { gte: 20 },
      })
      expect(result.map((r) => r.id)).toEqual([2, 4])
    })

    it('should return empty when AND conditions cannot all be satisfied', () => {
      const result = filterWhere(RECORDS, {
        active: { eq: true },
        active2: { eq: false },
      } as any)
      // active2 is undefined on all records; undefined !== false
      expect(result).toEqual([])
    })
  })

  describe('top-level and / or arrays', () => {
    it('or array should return items matching any sub-filter', () => {
      const result = filterWhere(RECORDS, {
        or: [{ id: { eq: 1 } }, { id: { eq: 5 } }],
      })
      expect(result.map((r) => r.id)).toEqual([1, 5])
    })

    it('and array should return items matching all sub-filters', () => {
      const result = filterWhere(RECORDS, {
        and: [{ score: { gte: 20 } }, { score: { lte: 40 } }],
      })
      expect(result.map((r) => r.id)).toEqual([2, 3, 4])
    })

    it('and array with no matches should return empty', () => {
      const result = filterWhere(RECORDS, {
        and: [{ id: { eq: 1 } }, { id: { eq: 2 } }],
      })
      expect(result).toEqual([])
    })

    it('or combined with field condition should AND the two', () => {
      // items matching (id=1 OR id=2) AND active=true
      const result = filterWhere(RECORDS, {
        or: [{ id: { eq: 1 } }, { id: { eq: 2 } }],
        active: { eq: true },
      })
      expect(result.map((r) => r.id)).toEqual([1, 2])
    })

    it('nested or inside or should work', () => {
      const result = filterWhere(RECORDS, {
        or: [{ or: [{ id: { eq: 1 } }, { id: { eq: 2 } }] }, { id: { eq: 5 } }],
      })
      expect(result.map((r) => r.id)).toEqual([1, 2, 5])
    })
  })

  describe('and / or within a field filter', () => {
    it('and within a string field should require all string conditions', () => {
      // name must contain 'a' AND end with 'e'
      const result = filterWhere(RECORDS, {
        name: {
          and: [{ contains: 'a' }, { endsWith: 'e' }],
        },
      })
      expect(result.map((r) => r.name)).toEqual(['Date'])
    })

    it('or within a string field should require at least one string condition', () => {
      // name starts with 'A' OR ends with 't'
      const result = filterWhere(RECORDS, {
        name: {
          or: [{ startsWith: 'A' }, { endsWith: 't' }],
        },
      })
      expect(result.map((r) => r.name)).toEqual(['Apple', 'Carrot', 'Eggplant'])
    })
  })

  describe('edge cases', () => {
    it('should return all records when where is an empty object', () => {
      const result = filterWhere(RECORDS, {})
      expect(result).toEqual(RECORDS)
    })

    it('should return empty array when input array is empty', () => {
      const result = filterWhere([], { id: { eq: 1 } })
      expect(result).toEqual([])
    })
  })
})

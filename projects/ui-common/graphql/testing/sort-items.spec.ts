import { sortItems } from './sort-items'

interface Item {
  id: number
  name: string
  score: number | null
}

const ITEMS: Item[] = [
  { id: 3, name: 'Carrot', score: 30 },
  { id: 1, name: 'Apple', score: 10 },
  { id: 4, name: 'Date', score: null },
  { id: 2, name: 'Banana', score: 20 },
  { id: 5, name: 'Eggplant', score: 50 },
]

describe('sortItems', () => {
  describe('no-op cases', () => {
    it('should return the same array when order is empty', () => {
      const result = sortItems(ITEMS, [])
      expect(result).toEqual(ITEMS)
    })

    it('should not mutate the input array', () => {
      const copy = [...ITEMS]
      sortItems(ITEMS, [{ id: 'ASC' }])
      expect(ITEMS).toEqual(copy)
    })
  })

  describe('single-field numeric sort', () => {
    it('sorts by number ASC', () => {
      const result = sortItems(ITEMS, [{ id: 'ASC' }])
      expect(result.map((r) => r.id)).toEqual([1, 2, 3, 4, 5])
    })

    it('sorts by number DESC', () => {
      const result = sortItems(ITEMS, [{ id: 'DESC' }])
      expect(result.map((r) => r.id)).toEqual([5, 4, 3, 2, 1])
    })
  })

  describe('single-field string sort', () => {
    it('sorts by string ASC', () => {
      const result = sortItems(ITEMS, [{ name: 'ASC' }])
      expect(result.map((r) => r.name)).toEqual([
        'Apple',
        'Banana',
        'Carrot',
        'Date',
        'Eggplant',
      ])
    })

    it('sorts by string DESC', () => {
      const result = sortItems(ITEMS, [{ name: 'DESC' }])
      expect(result.map((r) => r.name)).toEqual([
        'Eggplant',
        'Date',
        'Carrot',
        'Banana',
        'Apple',
      ])
    })
  })

  describe('null handling', () => {
    it('puts null values last for ASC sort', () => {
      const result = sortItems(ITEMS, [{ score: 'ASC' }])
      const ids = result.map((r) => r.id)
      // id=4 has null score, should be last
      expect(ids[ids.length - 1]).toBe(4)
      expect(ids.slice(0, -1)).toEqual([1, 2, 3, 5])
    })

    it('puts null values last for DESC sort', () => {
      const result = sortItems(ITEMS, [{ score: 'DESC' }])
      const ids = result.map((r) => r.id)
      // id=4 has null score, should be last
      expect(ids[ids.length - 1]).toBe(4)
      expect(ids.slice(0, -1)).toEqual([5, 3, 2, 1])
    })
  })

  describe('multi-field sort', () => {
    it('uses second clause to break ties', () => {
      const items = [
        { id: 1, name: 'Banana', score: 20 },
        { id: 2, name: 'Apple', score: 20 },
        { id: 3, name: 'Cherry', score: 10 },
      ]

      const result = sortItems(items, [{ score: 'ASC' }, { name: 'ASC' }])
      expect(result.map((r) => r.name)).toEqual(['Cherry', 'Apple', 'Banana'])
    })

    it('second clause only applies when first is tied', () => {
      const items = [
        { id: 1, name: 'Zebra', score: 10 },
        { id: 2, name: 'Apple', score: 20 },
        { id: 3, name: 'Mango', score: 10 },
      ]

      const result = sortItems(items, [{ score: 'ASC' }, { name: 'DESC' }])
      // score 10s: Zebra and Mango tied; secondary DESC name → Zebra before Mango
      expect(result.map((r) => r.name)).toEqual(['Zebra', 'Mango', 'Apple'])
    })
  })

  describe('stable sort', () => {
    it('preserves original order for equal items', () => {
      const items = [
        { id: 1, name: 'A', score: 5 },
        { id: 2, name: 'B', score: 5 },
        { id: 3, name: 'C', score: 5 },
      ]

      const result = sortItems(items, [{ score: 'ASC' }])
      expect(result.map((r) => r.id)).toEqual([1, 2, 3])
    })
  })
})

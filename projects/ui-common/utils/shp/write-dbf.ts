import { GeoJsonProperties } from 'geojson'

/** ESRI's limit for a double column. */
const MAX_N_WIDTH = 19
const MAX_C_WIDTH = 254
const NAME_PATTERN = /^[\x21-\x7e][\x20-\x7e]*$/

type ColumnType = 'C' | 'N' | 'L' | 'D'

interface Column {
  name: string
  type: ColumnType
  width: number
  decimals: number
  /** One encoded cell per row, already padded to `width`. */
  cells: Uint8Array[]
}

function isEmpty(value: unknown): value is null | undefined {
  return value === null || value === undefined
}

function typeOf(name: string, value: unknown): ColumnType {
  if (typeof value === 'string') return 'C'
  if (typeof value === 'number' && Number.isFinite(value)) return 'N'
  if (typeof value === 'boolean') return 'L'
  if (value instanceof Date && !Number.isNaN(value.getTime())) return 'D'
  throw new Error(
    `Attribute "${name}" has a value that cannot be written to a .dbf file: ${describe(value)}.`,
  )
}

function describe(value: unknown): string {
  if (typeof value === 'number') return String(value)
  if (value instanceof Date) return 'an invalid Date'
  if (Array.isArray(value)) return 'an array'
  return `a ${typeof value}`
}

function validateNames(names: string[]) {
  const seen = new Map<string, string>()
  for (const name of names) {
    if (name.length === 0 || !NAME_PATTERN.test(name)) {
      throw new Error(
        `Attribute name "${name}" must be non-empty printable ASCII.`,
      )
    }
    if (name.length > 10) {
      throw new Error(`Attribute name "${name}" is longer than 10 characters.`)
    }
    const key = name.toLowerCase()
    const previous = seen.get(key)
    if (previous !== undefined) {
      throw new Error(
        `Attribute names "${previous}" and "${name}" differ only in case.`,
      )
    }
    seen.set(key, name)
  }
}

function ascii(text: string): Uint8Array {
  return Uint8Array.from(text, (ch) => ch.charCodeAt(0))
}

function padded(bytes: Uint8Array, width: number, fill: number): Uint8Array {
  const out = new Uint8Array(width).fill(fill)
  out.set(bytes)
  return out
}

function twoDigits(n: number, width = 2): string {
  return String(n).padStart(width, '0')
}

function numberParts(v: number) {
  const [int, frac = ''] = Math.abs(v)
    .toFixed(15)
    .replace(/\.?0+$/, '')
    .split('.')
  return { lead: (v < 0 ? 1 : 0) + int.length, frac }
}

function buildColumn(name: string, values: unknown[]): Column {
  const types = new Set<ColumnType>()
  for (const value of values) {
    if (!isEmpty(value)) types.add(typeOf(name, value))
  }
  if (types.size > 1) {
    throw new Error(
      `Attribute "${name}" mixes value types (${[...types].join(', ')}); a .dbf column holds one type.`,
    )
  }
  const type: ColumnType = types.size === 0 ? 'C' : [...types][0]
  const nonEmpty = values.filter((v) => !isEmpty(v))
  const column = { name, type, width: 1, decimals: 0 }

  switch (type) {
    case 'C': {
      const encoder = new TextEncoder()
      const encoded = values.map((v) =>
        isEmpty(v) ? new Uint8Array(0) : encoder.encode(v as string),
      )
      const longest = Math.max(1, ...encoded.map((e) => e.length))
      if (longest > MAX_C_WIDTH) {
        throw new Error(
          `Attribute "${name}" has a text value of ${longest} UTF-8 bytes; the .dbf limit is ${MAX_C_WIDTH}.`,
        )
      }
      return {
        ...column,
        width: longest,
        cells: encoded.map((e) => padded(e, longest, 0x20)),
      }
    }
    case 'N': {
      const nums = nonEmpty as number[]
      const parts = nums.map((v) =>
        Math.abs(v) >= 1e21 ? null : numberParts(v),
      )
      const tooWide = () =>
        new Error(
          `Attribute "${name}" has a number too wide for a .dbf column (limit ${MAX_N_WIDTH} characters).`,
        )
      if (parts.some((p) => p === null)) throw tooWide()
      const ok = parts as { lead: number; frac: string }[]
      const maxLead = Math.max(...ok.map((p) => p.lead))
      let decimals = Math.min(15, Math.max(...ok.map((p) => p.frac.length)))
      const widthFor = (d: number) => maxLead + (d > 0 ? d + 1 : 0)
      if (widthFor(decimals) > MAX_N_WIDTH) {
        decimals = Math.max(8, MAX_N_WIDTH - maxLead - 1)
      }
      if (widthFor(decimals) > MAX_N_WIDTH) throw tooWide()
      const width = widthFor(decimals)
      return {
        ...column,
        width,
        decimals,
        cells: values.map((v) =>
          ascii(
            isEmpty(v)
              ? ' '.repeat(width)
              : (v as number).toFixed(decimals).padStart(width),
          ),
        ),
      }
    }
    case 'L':
      return {
        ...column,
        cells: values.map((v) => ascii(isEmpty(v) ? '?' : v ? 'T' : 'F')),
      }
    case 'D':
      return {
        ...column,
        width: 8,
        cells: values.map((v) => {
          if (isEmpty(v)) return ascii(' '.repeat(8))
          const d = v as Date
          const year = d.getFullYear()
          if (year < 0 || year > 9999) {
            throw new Error(
              `Attribute "${name}" has a Date with year ${year}; a .dbf date column holds years 0 to 9999.`,
            )
          }
          return ascii(
            twoDigits(d.getFullYear(), 4) +
              twoDigits(d.getMonth() + 1) +
              twoDigits(d.getDate()),
          )
        }),
      }
  }
}

/**
 * Writes a dBASE III `.dbf` with one record per row, in row order. `null` rows
 * are treated as `{}`. Text, names and dates are never shortened, renamed or
 * dropped: they throw instead. Numbers are rounded in two ways:
 * - Decimals are capped at 15 for every column, so `1.23456789e-10` is written
 *   as `0.000000000123457` and a magnitude below 5e-16 is written as `0`.
 * - A column too wide for 19 characters sheds decimals down to a minimum of 8,
 *   so in `[1234567890, 0.123456789012345]` the second value becomes
 *   `0.12345679`.
 */
export function writeDbf(rows: GeoJsonProperties[]): Uint8Array {
  const records = rows.map((row) => row ?? {})
  const names: string[] = []
  const known = new Set<string>()
  for (const record of records) {
    for (const key of Object.keys(record)) {
      if (!known.has(key)) {
        known.add(key)
        names.push(key)
      }
    }
  }
  validateNames(names)

  let columns: Column[]
  if (names.length === 0) {
    const width = String(records.length).length
    columns = [
      {
        name: 'ID',
        type: 'N',
        width,
        decimals: 0,
        cells: records.map((_, i) => ascii(String(i + 1).padStart(width))),
      },
    ]
  } else {
    columns = names.map((name) =>
      buildColumn(
        name,
        records.map((r) => r[name]),
      ),
    )
  }

  const headerLength = 32 * (columns.length + 1) + 1
  const recordLength = 1 + columns.reduce((sum, c) => sum + c.width, 0)
  const bytes = new Uint8Array(headerLength + recordLength * records.length + 1)
  const view = new DataView(bytes.buffer)
  const today = new Date()
  bytes[0] = 0x03
  bytes[1] = today.getFullYear() - 1900
  bytes[2] = today.getMonth() + 1
  bytes[3] = today.getDate()
  view.setUint32(4, records.length, true)
  view.setUint16(8, headerLength, true)
  view.setUint16(10, recordLength, true)

  columns.forEach((column, i) => {
    const at = 32 + 32 * i
    bytes.set(ascii(column.name), at)
    bytes[at + 11] = column.type.charCodeAt(0)
    bytes[at + 16] = column.width
    bytes[at + 17] = column.decimals
  })
  bytes[headerLength - 1] = 0x0d

  let offset = headerLength
  records.forEach((_, r) => {
    bytes[offset++] = 0x20
    for (const column of columns) {
      bytes.set(column.cells[r], offset)
      offset += column.width
    }
  })
  bytes[offset] = 0x1a
  return bytes
}

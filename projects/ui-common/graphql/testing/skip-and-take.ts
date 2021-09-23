export function skipAndTake<T>(data: T[], skip: number, take: number): T[] {
  if (skip < 0) {
    throw Error(`Invalid 'skip' value: ${skip}`, )
  }

  if (take > data.length) {
    throw Error(`Invalid 'take' value: ${take}`, )
  }

  const tmp: T[] = []
  for (let i = skip; i < take; i++) {
    tmp.push(data[i])
  }

  return tmp
}

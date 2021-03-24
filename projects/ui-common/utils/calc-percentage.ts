export function calcPercentage(total: number, n: number) {
  return total && total > 0 ? (n / total) * 100 : 0
}

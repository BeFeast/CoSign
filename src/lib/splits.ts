// Even-split math with penny-accurate rounding so the total is always exactly 100.

export function evenSplits(count: number): number[] {
  if (count <= 0) return []
  const base = Math.floor((100 / count) * 100) / 100 // 2dp floor
  const splits = new Array(count).fill(base)
  let remainder = Math.round((100 - base * count) * 100) / 100
  // distribute leftover pennies to the first members
  let i = 0
  while (remainder > 0.0001) {
    splits[i % count] = Math.round((splits[i % count] + 0.01) * 100) / 100
    remainder = Math.round((remainder - 0.01) * 100) / 100
    i++
  }
  return splits
}

export function sumSplits(values: number[]): number {
  return Math.round(values.reduce((a, b) => a + b, 0) * 100) / 100
}

export function splitsAreValid(values: number[]): boolean {
  return sumSplits(values) === 100 && values.every((v) => v >= 0)
}

// Rebalance a set of splits evenly (used when roster changes are approved).
export function rebalanceEven<T>(members: T[]): Array<T & { split_percent: number }> {
  const splits = evenSplits(members.length)
  return members.map((m, i) => ({ ...m, split_percent: splits[i] }))
}

/**
 * Static SVG path data for sparkline mini-charts.
 * ViewBox: 0 0 80 30
 * Each path represents a gentle wave for the corresponding wallet coin.
 */
export const sparklinePaths: Record<string, string> = {
  BTC: 'M0,22 C5,20 8,15 14,14 C20,13 22,18 28,16 C34,14 36,8 42,9 C48,10 50,18 56,15 C62,12 64,7 70,8 C74,9 77,12 80,10',
  STEEM: 'M0,18 C4,16 8,20 14,18 C20,16 22,12 28,13 C34,14 36,20 42,18 C48,16 50,10 56,12 C62,14 66,18 72,16 C76,15 78,12 80,13',
  DASH: 'M0,24 C6,22 10,16 16,15 C22,14 24,20 30,18 C36,16 38,10 44,11 C50,12 52,20 58,17 C64,14 66,8 72,9 C76,10 78,14 80,12',
  DROP: 'M0,20 C4,18 8,22 14,20 C20,18 22,14 28,15 C34,16 36,22 42,20 C48,18 50,12 56,14 C62,16 66,20 72,18 C76,17 78,14 80,15',
}

export const sparklineColors: Record<string, string> = {
  BTC: '#f7931a',
  STEEM: '#4ade80',
  DASH: '#4ade80',
  DROP: '#4ade80',
}

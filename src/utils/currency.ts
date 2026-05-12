// ─── Currency utility ─────────────────────────────────────────────────────────
// Maps ISO 4217 currency codes to their display symbols.
// Used platform-wide to replace hardcoded '$' with the user's selected currency.

export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',   EUR: '€',   GBP: '£',   JPY: '¥',   CNY: '¥',
  INR: '₹',   BRL: 'R$',  CAD: 'CA$', AUD: 'A$',  NZD: 'NZ$',
  CHF: 'Fr',  SEK: 'kr',  NOK: 'kr',  DKK: 'kr',  HKD: 'HK$',
  SGD: 'S$',  MXN: 'MX$', ZAR: 'R',   NGN: '₦',   KES: 'KSh',
  GHS: '₵',   EGP: 'E£',  MAD: 'MAD', TZS: 'TSh', UGX: 'USh',
  RWF: 'RF',  ETB: 'Br',  XOF: 'CFA', XAF: 'CFA', MZN: 'MT',
  ZMW: 'ZK',  ZWL: 'Z$',  NAD: 'N$',  BWP: 'P',   MGA: 'Ar',
  SLL: 'Le',  GNF: 'FG',  BIF: 'Fr',  TND: 'DT',  LYD: 'LD',
  DZD: 'DA',  SDG: 'SDG', SOS: 'Sh',  MWK: 'MK',  AOA: 'Kz',
  CDF: 'FC',  GMD: 'D',   SZL: 'L',   LSL: 'L',   MUR: '₨',
  SCR: '₨',   KMF: 'CF',  DJF: 'Fdj', ERN: 'Nfk', LRD: 'L$',
  SAR: '﷼',   AED: 'د.إ', QAR: '﷼',   KWD: 'KD',  BHD: 'BD',
  OMR: '﷼',   JOD: 'JD',  LBP: 'L£',  IQD: 'IQD', IRR: '﷼',
  SYP: '£',   YER: '﷼',   ILS: '₪',   TRY: '₺',   RUB: '₽',
  UAH: '₴',   KZT: '₸',   UZS: 'лв',  AZN: '₼',   GEL: '₾',
  AMD: '֏',   KGS: 'лв',  TJS: 'SM',  TMT: 'T',   MNT: '₮',
  PKR: '₨',   BDT: '৳',   LKR: '₨',   NPR: '₨',   MVR: 'Rf',
  BTN: 'Nu',  MMK: 'K',   THB: '฿',   VND: '₫',   KHR: '៛',
  LAK: '₭',   MYR: 'RM',  IDR: 'Rp',  PHP: '₱',   TWD: 'NT$',
  KRW: '₩',   KPW: '₩',   HKD2: 'HK$',MOP: 'P',   BND: 'B$',
  PGK: 'K',   FJD: 'FJ$', SBD: 'SI$', VUV: 'VT',  WST: 'WS$',
  TOP: 'T$',  PYG: '₲',   BOB: 'Bs',  PEN: 'S/',  CLP: 'CL$',
  COP: 'CO$', VES: 'Bs.S',UYU: '$U',  ARS: 'AR$', GYD: 'GY$',
  SRD: 'SR$', TTD: 'TT$', JMD: 'J$',  BBD: 'Bds$',BSD: 'B$',
  BZD: 'BZ$', GTQ: 'Q',   HNL: 'L',   NIO: 'C$',  CRC: '₡',
  PAB: 'B/.',  DOP: 'RD$', HTG: 'G',   CUP: '₱',   AWG: 'ƒ',
  ANG: 'ƒ',   XCD: 'EC$', KYD: 'CI$', BMD: 'BD$', MKD: 'ден',
  ALL: 'L',   BAM: 'KM',  HRK: 'kn',  RSD: 'din', BGN: 'лв',
  RON: 'lei', HUF: 'Ft',  CZK: 'Kč',  PLN: 'zł',  ISK: 'kr',
  MDL: 'L',   BYN: 'Br',  GIP: '£',   FKP: '£',   SHP: '£',
  STN: 'Db',  CVE: '$',   MRU: 'UM',  KPW2: '₩',
}

/**
 * Returns the display symbol for a given ISO 4217 currency code.
 * Falls back to the code itself if not found (e.g. "XYZ").
 */
export function getCurrencySymbol(code: string): string {
  if (!code) return '$'
  return CURRENCY_SYMBOLS[code.toUpperCase()] ?? code
}

/**
 * Formats a number as a currency string using the user's currency symbol.
 * Uses Intl.NumberFormat for proper locale formatting, then swaps the symbol.
 */
export function formatCurrency(
  amount: number,
  currencyCode: string,
  options: { minimumFractionDigits?: number; maximumFractionDigits?: number } = {}
): string {
  const { minimumFractionDigits = 2, maximumFractionDigits = 2 } = options
  const symbol = getCurrencySymbol(currencyCode)

  // Format the number part with en-US locale (comma separators)
  const numStr = new Intl.NumberFormat('en-US', {
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(Math.abs(amount))

  const sign = amount < 0 ? '-' : ''
  return `${sign}${symbol}${numStr}`
}

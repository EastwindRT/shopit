import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type Money = { amount: number; currency: string }

/** Format UCP money: integer minor units. 8999 => "$89.99", 8900 => "$89", 1250 => "$12.50" */
export function formatMoney(money: Money | null | undefined): string {
  if (!money) return ''
  const isWhole = money.amount % 100 === 0
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: money.currency,
    minimumFractionDigits: isWhole ? 0 : 2,
    maximumFractionDigits: isWhole ? 0 : 2,
  }).format(money.amount / 100)
}

/** Render a price range. Shows a single price when min == max, otherwise "$X – $Y" (same currency). */
export function formatMoneyRange(
  range: { min?: Money | null; max?: Money | null } | null | undefined,
): string {
  if (!range?.min) return ''
  const min = range.min
  const max = range.max
  if (!max || max.amount === min.amount) return formatMoney(min)
  if (max.currency !== min.currency) return formatMoney(min)
  return `${formatMoney(min)} – ${formatMoney(max)}`
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length).trimEnd() + '…'
}

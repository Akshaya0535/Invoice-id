import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount)
}

export function calculateTax(amount: number, taxRate: number): number {
  return (amount * taxRate) / 100
}

export function getCurrentFinancialYear(): string {
  const today = new Date()
  const currentYear = today.getFullYear()
  const month = today.getMonth()

  // Financial year in India starts from April
  const startYear = month < 3 ? currentYear - 1 : currentYear
  const endYear = startYear + 1

  return `${startYear.toString().slice(-2)}-${endYear.toString().slice(-2)}`
}

export function generateInvoiceNumber(lastInvoiceNumber: string | null, financialYear: string): string {
  // If there's no previous invoice or it's from a different financial year, start from 01
  if (!lastInvoiceNumber || !lastInvoiceNumber.includes(financialYear)) {
    return `01/${financialYear}`
  }

  // Extract the numeric part and increment
  const parts = lastInvoiceNumber.split("/")
  const numericPart = Number.parseInt(parts[0], 10)
  const nextNumber = (numericPart + 1).toString().padStart(2, "0")

  return `${nextNumber}/${financialYear}`
}

export function isDateAfter(date: Date, compareDate: Date): boolean {
  return date.getTime() > compareDate.getTime()
}

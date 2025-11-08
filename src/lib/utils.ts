import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, differenceInDays } from 'date-fns'
import { th, enUS } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date, formatStr: string = 'PPP', locale: 'th' | 'en' = 'th') {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return format(dateObj, formatStr, { locale: locale === 'th' ? th : enUS })
}

export function formatCurrency(amount: number, currency: string = 'THB') {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency,
  }).format(amount)
}

export function calculateDays(startDate: string | Date, endDate: string | Date): number {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate
  return differenceInDays(end, start) + 1
}

export function generateBookingNumber(): string {
  const prefix = 'BK'
  const year = new Date().getFullYear()
  const random = Math.floor(Math.random() * 100000)
    .toString()
    .padStart(5, '0')
  return `${prefix}${year}${random}`
}

export function calculateBookingPrice(
  dailyRate: number,
  days: number,
  addonsTotal: number = 0,
  serviceFeePercentage: number = 10
) {
  const basePrice = dailyRate * days
  const totalBeforeFee = basePrice + addonsTotal
  const serviceFee = totalBeforeFee * (serviceFeePercentage / 100)
  const totalPrice = totalBeforeFee + serviceFee

  return {
    basePrice,
    addonsPrice: addonsTotal,
    serviceFee,
    totalPrice,
    depositAmount: totalPrice * 0.3, // 30% deposit
    remainingAmount: totalPrice * 0.7,
  }
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING_ASSIGNMENT: 'bg-yellow-100 text-yellow-800',
    PENDING_PARTNER_CONFIRMATION: 'bg-orange-100 text-orange-800',
    CONFIRMED: 'bg-blue-100 text-blue-800',
    IN_PROGRESS: 'bg-purple-100 text-purple-800',
    PICKED_UP: 'bg-indigo-100 text-indigo-800',
    RETURNED: 'bg-green-100 text-green-800',
    COMPLETED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    suspended: 'bg-red-100 text-red-800',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

export function getStatusLabel(status: string, lang: 'th' | 'en' = 'th'): string {
  const labels: Record<string, { th: string; en: string }> = {
    PENDING_ASSIGNMENT: { th: 'รอมอบหมายงาน', en: 'Pending Assignment' },
    PENDING_PARTNER_CONFIRMATION: { th: 'รอ Partner ยืนยัน', en: 'Pending Partner Confirmation' },
    CONFIRMED: { th: 'ยืนยันแล้ว', en: 'Confirmed' },
    IN_PROGRESS: { th: 'กำลังดำเนินการ', en: 'In Progress' },
    PICKED_UP: { th: 'รับรถแล้ว', en: 'Picked Up' },
    RETURNED: { th: 'คืนรถแล้ว', en: 'Returned' },
    COMPLETED: { th: 'เสร็จสิ้น', en: 'Completed' },
    CANCELLED: { th: 'ยกเลิก', en: 'Cancelled' },
  }
  return labels[status]?.[lang] || status
}

export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

export function validatePhone(phone: string): boolean {
  const re = /^[0-9]{9,10}$/
  return re.test(phone.replace(/[-\s]/g, ''))
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

export async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function getImageUrl(path: string | null | undefined, bucket: string = 'vehicles'): string {
  if (!path) return '/placeholder-vehicle.jpg'
  if (path.startsWith('http')) return path
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`
}

export function calculateCommission(amount: number, commissionRate: number): number {
  return amount * (commissionRate / 100)
}

export function getVehicleTypeLabel(type: string, lang: 'th' | 'en' = 'th'): string {
  const labels: Record<string, { th: string; en: string }> = {
    sedan: { th: 'รถเก๋ง', en: 'Sedan' },
    suv: { th: 'รถ SUV', en: 'SUV' },
    van: { th: 'รถตู้', en: 'Van' },
    pickup: { th: 'รถกระบะ', en: 'Pickup' },
    luxury: { th: 'รถหรู', en: 'Luxury' },
  }
  return labels[type]?.[lang] || type
}

export function getRentalTypeLabel(type: string, lang: 'th' | 'en' = 'th'): string {
  const labels: Record<string, { th: string; en: string }> = {
    self_drive: { th: 'ขับเอง', en: 'Self Drive' },
    with_driver: { th: 'พร้อมคนขับ', en: 'With Driver' },
  }
  return labels[type]?.[lang] || type
}

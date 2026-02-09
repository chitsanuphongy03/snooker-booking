import type { Booking } from '../types'

// Booking Status Labels (Thai)
export const BOOKING_STATUS_LABELS: Record<Booking['status'], string> = {
  confirmed: 'มาแล้ว',
  pending: 'รอดำเนินการ',
  completed: 'เสร็จสิ้น',
  cancelled: 'ยกเลิก',
  no_show: 'ไม่มาตามนัด'
}

// Get Thai label for booking status
export function getBookingStatusLabel(status: Booking['status']): string {
  return BOOKING_STATUS_LABELS[status] || status
}

// Get color classes for booking status badges
export function getBookingStatusBadgeClasses(status: Booking['status']): string {
  switch (status) {
    case 'confirmed':
      return 'bg-green-50 text-green-500 border-green-100'
    case 'pending':
      return 'bg-blue-50 text-blue-500 border-blue-100'
    case 'completed':
      return 'bg-emerald-50 text-emerald-500 border-emerald-100'
    case 'cancelled':
      return 'bg-red-50 text-red-500 border-red-100'
    case 'no_show':
      return 'bg-slate-50 text-slate-400 border-slate-100'
    default:
      return 'bg-slate-50 text-slate-400 border-slate-100'
  }
}

// Get status color for BookingStatusPage style
export function getBookingStatusColor(status: Booking['status']): string {
  switch (status) {
    case 'confirmed':
      return 'text-green-500 bg-green-50 border-green-100'
    case 'pending':
      return 'text-emerald-600 bg-emerald-50 border-emerald-100'
    case 'cancelled':
      return 'text-red-500 bg-red-50 border-red-100'
    case 'no_show':
      return 'text-slate-500 bg-slate-50 border-slate-100'
    default:
      return 'text-slate-500 bg-slate-50 border-slate-100'
  }
}

// Get status display classes for BookingsManagement style
export function getBookingStatusDisplayClasses(status: Booking['status']): string {
  switch (status) {
    case 'confirmed':
      return 'bg-emerald-50 text-emerald-600'
    case 'no_show':
      return 'bg-slate-50 text-slate-400'
    case 'cancelled':
      return 'bg-red-50 text-red-400'
    case 'completed':
      return 'bg-blue-50 text-blue-500'
    default:
      return 'bg-slate-50 text-slate-400'
  }
}

// Display labels for BookingsManagement
export const BOOKING_MANAGEMENT_LABELS: Record<string, string> = {
  confirmed: 'กำลังใช้งาน',
  no_show: 'ปล่อยโต๊ะแล้ว',
  cancelled: 'ยกเลิกแล้ว',
  completed: 'เสร็จสิ้น'
}

export function getBookingManagementLabel(status: Booking['status']): string {
  return BOOKING_MANAGEMENT_LABELS[status] || ''
}

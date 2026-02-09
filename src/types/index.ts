export interface Table {
  id: string
  name: string
  type: 'standard' | 'vip'
  pricePerHour: number
  status: 'available' | 'maintenance' | 'occupied'
  occupiedUntil?: string
  availableSlots?: string[]
}

export interface Booking {
  id: string
  tableId: string
  tableName?: string
  slipUrl?: string // URL of the uploaded payment slip
  customerName: string
  customerPhone: string
  date: string
  startTime: string
  endTime: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
  totalPrice: number
  createdAt: Date
}

export interface ShopSettings {
  id: string
  shop_name: string
  phone: string
  address: string
  open_time: string
  close_time: string
  standard_price: number
  vip_price: number
  late_threshold_minutes: number
  payment_qr_url?: string
}

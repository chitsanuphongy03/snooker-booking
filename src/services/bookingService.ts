import { supabase } from '../lib/supabaseClient'
import type { Table, Booking, ShopSettings } from '../types/index'

interface RawBooking {
  id: string
  table_id: string
  customer_name: string
  customer_phone: string
  date: string
  start_time: string
  end_time: string
  status: Booking['status']
  total_price: number
  created_at: string
  slip_url?: string
}

const mapBookingResponse = (b: RawBooking): Booking => ({
  id: b.id,
  tableId: b.table_id,
  customerName: b.customer_name,
  customerPhone: b.customer_phone,
  date: b.date,
  startTime: b.start_time,
  endTime: b.end_time,
  status: b.status,
  totalPrice: b.total_price,
  createdAt: new Date(b.created_at),
  slipUrl: b.slip_url
})

export async function updateBookingStatus(id: string, status: Booking['status']) {
  const { data, error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', id)
    .select()

  if (error) {
    console.error('Error updating booking status:', error)
    throw error
  }
  return mapBookingResponse(data[0])
}

export async function getTables(): Promise<Table[]> {
  const { data: tableData, error: tableError } = await supabase
    .from('tables')
    .select('*')
    .order('name')
  
  if (tableError) {
    console.error('Error fetching tables:', tableError)
    return []
  }

  const { data: settings } = await supabase
    .from('shop_settings')
    .select('*')
    .single()

  if (!settings) return tableData.map(t => ({ ...t, pricePerHour: 0, availableSlots: [] }))

  // Fetch all bookings for today to calculate availability
  const today = new Date().toISOString().split('T')[0]
  const { data: bookings } = await supabase
    .from('bookings')
    .select('*')
    .eq('date', today)
    .in('status', ['pending', 'confirmed', 'completed'])

  const bookingMap = (bookings || []).reduce((acc: Record<string, Booking[]>, b: RawBooking) => {
    if (!acc[b.table_id]) acc[b.table_id] = []
    acc[b.table_id].push(mapBookingResponse(b))
    return acc
  }, {})

  const now = new Date()
  const currentHour = now.getHours()
  const currentMin = now.getMinutes()
  const currentTotalMins = currentHour * 60 + currentMin
  const threshold = settings.late_threshold_minutes || 10

  // 1. Auto-cancel No-shows (side effect)
  const pendingBookings = (bookings || []).filter(b => b.status === 'pending')
  for (const b of pendingBookings) {
    const [bh, bm] = b.start_time.split(':').map(Number)
    const bStart = bh * 60 + bm
    if (currentTotalMins > bStart + threshold) {
      // Use optimistic update but also fire-and-forget DB update
      updateBookingStatus(b.id, 'no_show').catch(console.error)
      // Remove from map to update UI immediately
      if (bookingMap[b.table_id]) {
        bookingMap[b.table_id] = bookingMap[b.table_id].filter((bk: Booking) => bk.id !== b.id)
      }
    }
  }

  return tableData.map((t: Table) => {
    const tableBookings = bookingMap[t.id] || []
    
    // Generate slots for today
    const [h, m] = settings.open_time.split(':').map(Number)
    const [endH, endM] = settings.close_time.split(':').map(Number)
    
    const now = new Date()
    const currentHour = now.getHours()
    const currentMin = now.getMinutes()
    const currentTotalMins = currentHour * 60 + currentMin

    let currentTotal = h * 60 + m
    let endTotal = endH * 60 + endM
    if (endTotal <= currentTotal) endTotal += 24 * 60

    const slots: string[] = []
    while (currentTotal <= endTotal - 30) {
      const slotH = Math.floor(currentTotal / 60) % 24
      const slotM = currentTotal % 60
      const timeStr = `${String(slotH).padStart(2, '0')}:${String(slotM).padStart(2, '0')}`
      
      // Only future slots
      if (currentTotal > currentTotalMins) {
        // Check if occupied
        const isOccupied = tableBookings.some((b: Booking) => {
          const [bh, bm] = b.startTime.split(':').map(Number)
          const [eh, em] = b.endTime.split(':').map(Number)
          const bStart = bh * 60 + bm
          let bEnd = eh * 60 + em
          if (bEnd <= bStart) bEnd += 24 * 60
          return currentTotal >= bStart && currentTotal < bEnd
        })

        if (!isOccupied) {
          slots.push(timeStr)
        }
      }
      currentTotal += 30
    }

    // Limit to next 4 available slots for preview
    
    // Calculate occupiedUntil if currently occupied
    let occupiedUntil = undefined
    const ongoingBooking = tableBookings.find((b: Booking) => {
        const [bh, bm] = b.startTime.split(':').map(Number)
        const [eh, em] = b.endTime.split(':').map(Number)
        const bStart = bh * 60 + bm
        let bEnd = eh * 60 + em
        if (bEnd <= bStart) bEnd += 24 * 60
        return currentTotalMins >= bStart && currentTotalMins < bEnd && b.status === 'confirmed'
    })

    if (ongoingBooking) {
        occupiedUntil = ongoingBooking.endTime
    }

    // 2. Auto-release Occupied Tables
    if (t.status === 'occupied' && !ongoingBooking) {
        // Table is marked as occupied but no active booking exists
        updateTableStatus(t.id, 'available').catch(console.error)
        t.status = 'available'
    }

    return {
      ...t,
      pricePerHour: t.type === 'vip' ? (settings.vip_price || 0) : (settings.standard_price || 0),
      availableSlots: slots.slice(0, 4),
      occupiedUntil
    }
  })
}

export async function getBookings(date?: string): Promise<Booking[]> {
  let query = supabase
    .from('bookings')
    .select(`
      *,
      tables (
        name
      )
    `)
    .order('created_at', { ascending: false })
  
  if (date) {
    query = query.eq('date', date)
  }

  const { data, error } = await query
  
  if (error) {
    console.error('Error fetching bookings:', error)
    return []
  }
  
  return data.map(b => ({
    ...mapBookingResponse(b),
    tableName: b.tables?.name
  }))
}

export async function createBooking(booking: Omit<Booking, 'id' | 'createdAt'>) {
  // Normalize phone number (remove dashes)
  const normalizedPhone = booking.customerPhone.replace(/-/g, '')

  // Rate limiting: Check how many bookings this phone has made today
  const { count: todayBookingCount, error: countError } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('customer_phone', normalizedPhone)
    .eq('date', booking.date)
    .in('status', ['pending', 'confirmed'])

  if (countError) {
    console.error('Error checking rate limit:', countError)
  } else if (todayBookingCount && todayBookingCount >= 5) {
    throw new Error('จองได้สูงสุด 5 รายการต่อวัน กรุณาติดต่อพนักงานหากต้องการจองเพิ่ม')
  }

  // Check for overlapping bookings to prevent double booking
  const { data: existingBookings, error: checkError } = await supabase
    .from('bookings')
    .select('id, start_time, end_time')
    .eq('table_id', booking.tableId)
    .eq('date', booking.date)
    .in('status', ['pending', 'confirmed'])

  if (checkError) {
    console.error('Error checking existing bookings:', checkError)
    throw new Error('ไม่สามารถตรวจสอบการจองได้')
  }

  // Check for time overlap
  const newStart = timeToMinutes(booking.startTime)
  const newEnd = timeToMinutes(booking.endTime)

  for (const existing of existingBookings || []) {
    const existStart = timeToMinutes(existing.start_time)
    const existEnd = timeToMinutes(existing.end_time)

    // Check if times overlap
    if (newStart < existEnd && newEnd > existStart) {
      throw new Error('ช่วงเวลานี้มีคนจองแล้ว กรุณาเลือกเวลาอื่น')
    }
  }

  const { data, error } = await supabase
    .from('bookings')
    .insert([{
      table_id: booking.tableId,
      customer_name: booking.customerName,
      customer_phone: normalizedPhone,
      date: booking.date,
      start_time: booking.startTime,
      end_time: booking.endTime,
      status: booking.status,
      total_price: booking.totalPrice,
      slip_url: booking.slipUrl
    }])
    .select()

  if (error) throw error
  return mapBookingResponse(data[0])
}

// Helper function to convert time string to minutes
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

export async function createTable(table: Partial<Table>) {
  const { data, error } = await supabase
    .from('tables')
    .insert([{
      name: table.name,
      type: table.type,
      status: table.status || 'available',
      // price_per_hour is not in DB schema, it's derived from settings.
    }])
    .select()

  if (error) throw error
  return data[0]
}

export async function updateTable(id: string, updates: Partial<Table>) {
  const { data, error } = await supabase
    .from('tables')
    .update({
      name: updates.name,
      type: updates.type,
      // status handled by updateTableStatus often, but can be here too.
    })
    .eq('id', id)
    .select()

  if (error) throw error
  return data[0]
}

export async function deleteTable(id: string) {
  const { error } = await supabase
    .from('tables')
    .delete()
    .eq('id', id)

  if (error) throw error
  return true
}

export async function updateTableStatus(id: string, status: Table['status']) {
  const { data, error } = await supabase
    .from('tables')
    .update({ status })
    .eq('id', id)
    .select()

  if (error) {
    console.error('Error updating table status:', error)
    throw error
  }
  return data[0]
}

export async function getSettings() {
  const { data, error } = await supabase
    .from('shop_settings')
    .select('*')
    .single()
    
  if (error) {
    console.error('Error fetching settings:', error)
    return null
  }
  return data
}

export async function getBookingsByTableAndDate(tableId: string, date: string): Promise<Booking[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('table_id', tableId)
    .eq('date', date)
    .in('status', ['pending', 'confirmed', 'completed'])
  
  if (error) {
    console.error('Error fetching bookings by table and date:', error)
    return []
  }
  return data.map(mapBookingResponse)
}

export async function getBookingsByPhone(phone: string): Promise<Booking[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('customer_phone', phone)
    .order('created_at', { ascending: false })
    
  if (error) {
    console.error('Error fetching bookings by phone:', error)
    return []
  }
  return data.map(mapBookingResponse)
}

export async function updateSettings(settings: Partial<ShopSettings>) {
  const { data, error } = await supabase
    .from('shop_settings')
    .update(settings)
    .neq('id', '00000000-0000-0000-0000-000000000000') // Dummy condition to target all
    .select()

  if (error) throw error
  return data[0]
}

export async function getTableById(id: string): Promise<Table | null> {
  const { data: table, error } = await supabase
    .from('tables')
    .select('*')
    .eq('id', id)
    .single()
    
  if (error || !table) return null

  const { data: settings } = await supabase
    .from('shop_settings')
    .select('standard_price, vip_price')
    .single()

  return {
    ...table,
    pricePerHour: table.type === 'vip' ? (settings?.vip_price || 0) : (settings?.standard_price || 0)
  }
}

export async function getDashboardStats() {
  const today = new Date().toISOString().split('T')[0]
  
  // Fetch all today's bookings
  const { data: bookings, error: bError } = await supabase
    .from('bookings')
    .select('*')
    .eq('date', today)

  if (bError) throw bError

  // Fetch all tables
  const { data: tables, error: tError } = await supabase
    .from('tables')
    .select('id, status')

  if (tError) throw tError

  const mappedBookings = bookings.map(mapBookingResponse)

  // Calculate stats
  const total = mappedBookings.length
  const waiting = mappedBookings.filter(b => b.status === 'pending').length
  const arrived = mappedBookings.filter(b => b.status === 'confirmed').length
  const noshow = mappedBookings.filter(b => b.status === 'no_show' || b.status === 'cancelled').length

  const availableTables = tables.filter(t => t.status === 'available').length
  const totalTables = tables.length

  // Recent 5 bookings
  const { data: recent } = await supabase
    .from('bookings')
    .select(`
      *,
      tables (
        name
      )
    `)
    .order('created_at', { ascending: false })
    .limit(5)

  return {
    stats: [
      { label: 'จองวันนี้', value: String(total) },
      { label: 'ลูกค้ารอมา', value: String(waiting) },
      { label: 'มาแล้ว', value: String(arrived) },
      { label: 'ไม่มาตามนัด', value: String(noshow) },
    ],
    tableStatus: {
      available: availableTables,
      total: totalTables,
      occupied: totalTables - availableTables
    },
    recentBookings: (recent || []).map(b => ({
      ...mapBookingResponse(b),
      tableName: b.tables?.name
    }))
  }
}

export async function uploadSlip(file: File): Promise<string> {
  const fileExt = file.name.split('.').pop()
  const fileName = `${Math.random()}.${fileExt}`
  const filePath = `${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('slips')
    .upload(filePath, file)

  if (uploadError) {
    throw uploadError
  }

  const { data } = supabase.storage
    .from('slips')
    .getPublicUrl(filePath)

  return data.publicUrl
}

export async function uploadShopQR(file: File): Promise<string> {
  const fileExt = file.name.split('.').pop()
  const fileName = `payment_qr.${fileExt}` // Keep consistent name or usage unique if needed, but unique is better to avoid caching issues on update
  const filePath = `${Date.now()}_${fileName}` // timestamp to avoid cache

  const { error: uploadError } = await supabase.storage
    .from('shop-assets')
    .upload(filePath, file)

  if (uploadError) {
    throw uploadError
  }

  const { data } = supabase.storage
    .from('shop-assets')
    .getPublicUrl(filePath)

  return data.publicUrl
}

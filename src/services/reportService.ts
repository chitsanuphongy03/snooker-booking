import { supabase } from '../lib/supabaseClient'

export interface RevenueStats {
  date: string
  revenue: number
  bookingCount: number
}

export interface TableUsageStats {
  tableId: string
  tableName: string
  totalHours: number
  totalRevenue: number
  bookingCount: number
}

export interface PeakHourStats {
  hour: number
  bookingCount: number
}

// Get revenue statistics for a date range
export async function getRevenueStats(
  startDate: string,
  endDate: string
): Promise<RevenueStats[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select('date, total_price')
    .gte('date', startDate)
    .lte('date', endDate)
    .in('status', ['confirmed', 'completed'])
    .order('date')

  if (error) {
    console.error('Error fetching revenue stats:', error)
    return []
  }

  // Group by date
  const grouped: Record<string, RevenueStats> = {}
  
  for (const booking of data || []) {
    const date = booking.date as string
    const price = (booking.total_price as number) || 0
    
    if (!grouped[date]) {
      grouped[date] = {
        date,
        revenue: 0,
        bookingCount: 0
      }
    }
    grouped[date].revenue += price
    grouped[date].bookingCount += 1
  }

  return Object.values(grouped)
}

// Get table usage statistics
export async function getTableUsageStats(
  startDate: string,
  endDate: string
): Promise<TableUsageStats[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      table_id,
      total_price,
      start_time,
      end_time,
      tables (
        name
      )
    `)
    .gte('date', startDate)
    .lte('date', endDate)
    .in('status', ['confirmed', 'completed'])

  if (error) {
    console.error('Error fetching table usage stats:', error)
    return []
  }

  // Group by table
  const grouped: Record<string, TableUsageStats> = {}
  
  for (const booking of data || []) {
    const tableId = booking.table_id as string
    const totalPrice = (booking.total_price as number) || 0
    const startTime = booking.start_time as string
    const endTime = booking.end_time as string
    const tableName = ((booking.tables as unknown) as { name: string } | null)?.name || 'Unknown'
    
    if (!grouped[tableId]) {
      grouped[tableId] = {
        tableId,
        tableName,
        totalHours: 0,
        totalRevenue: 0,
        bookingCount: 0
      }
    }
    
    // Calculate hours from start_time and end_time
    const startMinutes = timeToMinutes(startTime)
    const endMinutes = timeToMinutes(endTime)
    const hours = (endMinutes - startMinutes) / 60

    grouped[tableId].totalHours += hours
    grouped[tableId].totalRevenue += totalPrice
    grouped[tableId].bookingCount += 1
  }

  return Object.values(grouped).sort((a, b) => b.totalRevenue - a.totalRevenue)
}

// Get peak hours statistics
export async function getPeakHours(
  startDate: string,
  endDate: string
): Promise<PeakHourStats[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select('start_time')
    .gte('date', startDate)
    .lte('date', endDate)
    .in('status', ['confirmed', 'completed'])

  if (error) {
    console.error('Error fetching peak hours:', error)
    return []
  }

  // Count bookings per hour
  const hourCounts: Record<number, number> = {}
  for (let i = 0; i < 24; i++) {
    hourCounts[i] = 0
  }

  for (const booking of data || []) {
    const hour = parseInt((booking.start_time as string).split(':')[0], 10)
    hourCounts[hour] = (hourCounts[hour] || 0) + 1
  }

  return Object.entries(hourCounts).map(([hour, count]) => ({
    hour: parseInt(hour, 10),
    bookingCount: count
  }))
}

// Get summary stats for dashboard
export async function getSummaryStats(date: string) {
  const { data: todayBookings, error } = await supabase
    .from('bookings')
    .select('status, total_price')
    .eq('date', date)

  if (error) {
    console.error('Error fetching summary stats:', error)
    return null
  }

  const stats = {
    totalBookings: todayBookings?.length || 0,
    confirmedBookings: 0,
    pendingBookings: 0,
    cancelledBookings: 0,
    totalRevenue: 0
  }

  for (const booking of todayBookings || []) {
    const status = booking.status as string
    const price = (booking.total_price as number) || 0
    
    if (status === 'confirmed' || status === 'completed') {
      stats.confirmedBookings += 1
      stats.totalRevenue += price
    } else if (status === 'pending') {
      stats.pendingBookings += 1
    } else if (status === 'cancelled' || status === 'no_show') {
      stats.cancelledBookings += 1
    }
  }

  return stats
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

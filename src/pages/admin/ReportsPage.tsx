import { useState, useEffect } from 'react'
import { Card } from '../../components/ui/Card'
import { Loading } from '../../components/ui/Loading'
import { 
  getRevenueStats, 
  getTableUsageStats, 
  getSummaryStats,
  type RevenueStats,
  type TableUsageStats
} from '../../services/reportService'
import { BarChart3, TrendingUp, Calendar, Clock, DollarSign, Users } from 'lucide-react'

export function ReportsPage() {
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    start: getDefaultStartDate(),
    end: new Date().toISOString().split('T')[0]
  })
  const [revenueStats, setRevenueStats] = useState<RevenueStats[]>([])
  const [tableStats, setTableStats] = useState<TableUsageStats[]>([])
  const [summaryStats, setSummaryStats] = useState<{
    totalBookings: number
    confirmedBookings: number
    pendingBookings: number
    cancelledBookings: number
    totalRevenue: number
  } | null>(null)

  useEffect(() => {
    async function loadStats() {
      setLoading(true)
      try {
        const [revenue, tables, summary] = await Promise.all([
          getRevenueStats(dateRange.start, dateRange.end),
          getTableUsageStats(dateRange.start, dateRange.end),
          getSummaryStats(new Date().toISOString().split('T')[0])
        ])
        setRevenueStats(revenue)
        setTableStats(tables)
        setSummaryStats(summary)
      } catch (error) {
        console.error('Error loading stats:', error)
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [dateRange.start, dateRange.end])

  function getToday() {
    return new Date().toISOString().split('T')[0]
  }

  function getDateDaysAgo(days: number) {
    const date = new Date()
    date.setDate(date.getDate() - days)
    return date.toISOString().split('T')[0]
  }

  function getMonthStart() {
    const date = new Date()
    return new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0]
  }

  function getLastMonthStart() {
    const date = new Date()
    return new Date(date.getFullYear(), date.getMonth() - 1, 1).toISOString().split('T')[0]
  }

  function getLastMonthEnd() {
    const date = new Date()
    return new Date(date.getFullYear(), date.getMonth(), 0).toISOString().split('T')[0]
  }

  function getDefaultStartDate() {
    return getDateDaysAgo(7)
  }

  const totalRevenue = revenueStats.reduce((sum, r) => sum + r.revenue, 0)
  const totalBookings = revenueStats.reduce((sum, r) => sum + r.bookingCount, 0)
  const avgRevenuePerDay = revenueStats.length > 0 ? totalRevenue / revenueStats.length : 0

  if (loading) {
    return <Loading />
  }

  return (
    <div className="space-y-4 md:space-y-6 animate-in fade-in slide-in-from-bottom-4">
      {/* Header - Stack on mobile */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="text-emerald-600" size={20} />
            รายงาน
          </h1>
          <p className="text-slate-500 text-xs md:text-sm">
            สรุปยอดขายและการใช้งาน
          </p>
        </div>

        {/* Period Selector Dropdown */}
        <select
          value={`${dateRange.start}_${dateRange.end}`}
          onChange={(e) => {
            const [start, end] = e.target.value.split('_')
            setDateRange({ start, end })
          }}
          className="bg-white rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full sm:w-auto"
        >
          <option value={`${getDateDaysAgo(7)}_${getToday()}`}>7 วันล่าสุด</option>
          <option value={`${getDateDaysAgo(14)}_${getToday()}`}>14 วันล่าสุด</option>
          <option value={`${getDateDaysAgo(30)}_${getToday()}`}>30 วันล่าสุด</option>
          <option value={`${getMonthStart()}_${getToday()}`}>เดือนนี้</option>
          <option value={`${getLastMonthStart()}_${getLastMonthEnd()}`}>เดือนที่แล้ว</option>
        </select>
      </div>

      {/* Summary Cards - 2 columns on mobile */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {/* Revenue Card */}
        <Card className="bg-emerald-500 text-white p-3 md:p-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <p className="text-emerald-100 text-[10px] md:text-xs uppercase font-medium">รายได้รวม</p>
              <DollarSign size={16} className="text-emerald-200" />
            </div>
            <p className="text-lg md:text-2xl font-bold">{totalRevenue.toLocaleString()} ฿</p>
          </div>
        </Card>

        {/* Bookings Card */}
        <Card className="bg-blue-500 text-white p-3 md:p-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <p className="text-blue-100 text-[10px] md:text-xs uppercase font-medium">การจอง</p>
              <Calendar size={16} className="text-blue-200" />
            </div>
            <p className="text-lg md:text-2xl font-bold">{totalBookings}</p>
          </div>
        </Card>

        {/* Average Card */}
        <Card className="bg-purple-500 text-white p-3 md:p-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <p className="text-purple-100 text-[10px] md:text-xs uppercase font-medium">เฉลี่ย/วัน</p>
              <TrendingUp size={16} className="text-purple-200" />
            </div>
            <p className="text-lg md:text-2xl font-bold">{Math.round(avgRevenuePerDay).toLocaleString()} ฿</p>
          </div>
        </Card>

        {/* Pending Card */}
        <Card className="bg-orange-500 text-white p-3 md:p-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <p className="text-orange-100 text-[10px] md:text-xs uppercase font-medium">รอดำเนินการ</p>
              <Clock size={16} className="text-orange-200" />
            </div>
            <p className="text-lg md:text-2xl font-bold">{summaryStats?.pendingBookings || 0}</p>
          </div>
        </Card>
      </div>

      {/* Revenue Chart - Mobile optimized */}
      <Card>
        <Card.Header>
          <Card.Title className="text-sm md:text-base">รายได้รายวัน</Card.Title>
        </Card.Header>
        <div className="p-3 md:p-4">
          {revenueStats.length > 0 ? (
            <div className="space-y-3">
              {revenueStats.map((stat) => (
                <div key={stat.date} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors border border-slate-100">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-slate-700 text-sm md:text-base">
                      {formatDate(stat.date)}
                    </span>
                    <span className="text-[10px] md:text-xs text-slate-400 flex items-center gap-1">
                      <Users size={12} />
                      {stat.bookingCount} คิว
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="block text-lg md:text-xl font-bold text-emerald-600">
                      +{stat.revenue.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-emerald-600/60 font-medium">บาท</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-slate-400 py-6 text-sm">
              ไม่มีข้อมูลในช่วงเวลาที่เลือก
            </p>
          )}
        </div>
      </Card>

      {/* Table Usage Stats - Card layout on mobile */}
      <Card>
        <Card.Header>
          <Card.Title className="text-sm md:text-base">การใช้งานโต๊ะ</Card.Title>
        </Card.Header>
        
        {/* Mobile: Card layout */}
        <div className="md:hidden p-3 space-y-2">
          {tableStats.length > 0 ? tableStats.map((table, index) => (
            <div 
              key={table.tableId} 
              className="flex items-center justify-between p-3 bg-slate-50 rounded-xl"
            >
              <div className="flex items-center gap-2">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                  ${index === 0 ? 'bg-yellow-100 text-yellow-600' : 
                    index === 1 ? 'bg-slate-200 text-slate-600' :
                    index === 2 ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-400'}`}>
                  {index + 1}
                </span>
                <div>
                  <p className="font-medium text-slate-900 text-sm">{table.tableName}</p>
                  <p className="text-[10px] text-slate-400">{table.bookingCount} จอง • {table.totalHours.toFixed(1)} ชม.</p>
                </div>
              </div>
              <p className="font-bold text-emerald-600 text-sm">{table.totalRevenue.toLocaleString()} ฿</p>
            </div>
          )) : (
            <p className="text-center text-slate-400 py-6 text-sm">ไม่มีข้อมูล</p>
          )}
        </div>

        {/* Desktop: Table layout */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left text-xs font-medium text-slate-500 uppercase px-4 py-3">โต๊ะ</th>
                <th className="text-center text-xs font-medium text-slate-500 uppercase px-4 py-3">จำนวนจอง</th>
                <th className="text-center text-xs font-medium text-slate-500 uppercase px-4 py-3">ชั่วโมงรวม</th>
                <th className="text-right text-xs font-medium text-slate-500 uppercase px-4 py-3">รายได้</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tableStats.map((table, index) => (
                <tr key={table.tableId} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                        ${index === 0 ? 'bg-yellow-100 text-yellow-600' : 
                          index === 1 ? 'bg-slate-100 text-slate-600' :
                          index === 2 ? 'bg-orange-100 text-orange-600' : 'bg-slate-50 text-slate-400'}`}>
                        {index + 1}
                      </span>
                      <span className="font-medium text-slate-900">{table.tableName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center text-slate-600">{table.bookingCount}</td>
                  <td className="px-4 py-3 text-center text-slate-600">{table.totalHours.toFixed(1)} ชม.</td>
                  <td className="px-4 py-3 text-right font-medium text-emerald-600">{table.totalRevenue.toLocaleString()} ฿</td>
                </tr>
              ))}
              {tableStats.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center text-slate-400 py-8">ไม่มีข้อมูล</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('th-TH', { 
    day: 'numeric', 
    month: 'short' 
  })
}

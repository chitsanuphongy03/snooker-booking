import { Card } from '../../components/ui/Card'
import { Users, CheckCircle2, XCircle, TrendingUp, ClipboardList, PlayCircle } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { getDashboardStats } from '../../services/bookingService'
import { Loading } from '../../components/ui/Loading'
import { cn } from '../../utils/cn'
import type { Booking } from '../../types'
import { getBookingStatusLabel, getBookingStatusBadgeClasses } from '../../utils/statusUtils'

export function AdminDashboard() {
  const [data, setData] = useState<{
    stats: { label: string; value: string; icon: LucideIcon; color: string; bg: string }[]
    tableStatus: { available: number; total: number; occupied: number }
    recentBookings: Booking[]
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDashboardStats().then(res => {
      const iconMap: Record<string, LucideIcon> = {
        'จองวันนี้': ClipboardList,
        'ลูกค้ารอมา': Users,
        'มาแล้ว': CheckCircle2,
        'ไม่มาตามนัด': XCircle
      }
      const colorMap: Record<string, string> = {
        'จองวันนี้': 'text-orange-500',
        'ลูกค้ารอมา': 'text-blue-500',
        'มาแล้ว': 'text-green-500',
        'ไม่มาตามนัด': 'text-red-500'
      }
      const bgMap: Record<string, string> = {
        'จองวันนี้': 'bg-orange-50',
        'ลูกค้ารอมา': 'bg-blue-50',
        'มาแล้ว': 'bg-green-50',
        'ไม่มาตามนัด': 'bg-red-50'
      }

      setData({
        stats: res.stats.map(s => ({
          ...s,
          icon: iconMap[s.label],
          color: colorMap[s.label],
          bg: bgMap[s.label]
        })),
        tableStatus: res.tableStatus,
        recentBookings: res.recentBookings
      })
      setLoading(false)
    })
  }, [])

  if (loading || !data) return <Loading />

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {data.stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-500 text-sm font-medium">{stat.label}</span>
                <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                  <stat.icon size={20} />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card>
          <Card.Header>
            <Card.Title>สถานะโต๊ะ</Card.Title>
            <Card.Description>สรุปการใช้งานโต๊ะตอนนี้</Card.Description>
          </Card.Header>
          <div className="space-y-6 pt-2">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Available */}
              <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-2xl flex flex-col items-center justify-center text-center space-y-1 hover:bg-emerald-50 transition-colors">
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-1">
                  <CheckCircle2 size={18} />
                </div>
                <div className="text-3xl font-extrabold text-emerald-700 leading-none">
                  {data.tableStatus.available}
                </div>
                <span className="text-xs font-bold text-emerald-600">ว่าง</span>
              </div>

              {/* Occupied */}
              <div className="bg-orange-50/50 border border-orange-100 p-4 rounded-2xl flex flex-col items-center justify-center text-center space-y-1 hover:bg-orange-50 transition-colors">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 mb-1">
                  <PlayCircle size={18} />
                </div>
                <div className="text-3xl font-extrabold text-orange-700 leading-none">
                  {data.tableStatus.occupied}
                </div>
                <span className="text-xs font-bold text-orange-600">กำลังเล่น</span>
              </div>
            </div>
          </div>
        </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <Card.Header>
            <Card.Title className="flex items-center gap-2">
              <TrendingUp size={20} className="text-orange-500" />
              การจองล่าสุด
            </Card.Title>
            <Card.Description>แสดงรายการจอง 5 รายการล่าสุดที่เข้ามา</Card.Description>
          </Card.Header>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-[10px] text-slate-400 uppercase font-bold tracking-wider border-b border-slate-50">
                <tr>
                  <th className="px-4 py-3">ชื่อ</th>
                  <th className="px-4 py-3">โต๊ะ</th>
                  <th className="px-4 py-3">เวลา</th>
                  <th className="px-4 py-3">สถานะ</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-50">
                {data.recentBookings.map((booking, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium">{booking.customerName}</td>
                    <td className="px-4 py-3 text-slate-500">{booking.tableName || `โต๊ะ ${booking.tableId.slice(0, 4)}`}</td>
                    <td className="px-4 py-3 text-slate-500">{booking.startTime} - {booking.endTime}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-start">
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border whitespace-nowrap",
                          getBookingStatusBadgeClasses(booking.status)
                        )}>
                          {getBookingStatusLabel(booking.status)}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}

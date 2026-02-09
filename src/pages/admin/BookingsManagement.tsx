import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { User, Clock, AlertTriangle, Calendar, Table as TableIcon, ClipboardList, Store, FileText } from 'lucide-react'
import { getBookings, updateBookingStatus, updateTableStatus } from '../../services/bookingService'
import type { Booking } from '../../types'
import { Loading } from '../../components/ui/Loading'
import { cn } from '../../utils/cn'
import { getBookingStatusDisplayClasses, getBookingManagementLabel } from '../../utils/statusUtils'

export function BookingsManagement() {
  const navigate = useNavigate()
  const dateInputRef = useRef<HTMLInputElement>(null)
  
  const getTodayStr = () => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }

  const [selectedDate, setSelectedDate] = useState(getTodayStr())
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  const loadBookings = useCallback(() => {
    setLoading(true)
    getBookings(selectedDate).then(data => {
      setBookings(data)
      setLoading(false)
    })
  }, [selectedDate])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadBookings()
  }, [loadBookings])

  const handleContainerClick = () => {
    try {
      if (dateInputRef.current && 'showPicker' in HTMLInputElement.prototype) {
        dateInputRef.current.showPicker()
      } else {
        dateInputRef.current?.focus()
      }
    } catch {
      dateInputRef.current?.focus()
    }
  }

  // Helper check for late bookings
  const isLate = (startTime: string, date: string) => {
    const today = new Date().toISOString().split('T')[0]
    if (date !== today) return false

    const [hours, minutes] = startTime.split(':').map(Number)
    const now = new Date()
    const start = new Date()
    start.setHours(hours, minutes, 0, 0)
    
    const diff = (now.getTime() - start.getTime()) / (1000 * 60)
    return diff > 10 
  }

  const handleStatusChange = async (id: string, newStatus: Booking['status'], tableId?: string) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b))

    try {
      await updateBookingStatus(id, newStatus)
      if (newStatus === 'confirmed' && tableId) {
        await updateTableStatus(tableId, 'occupied')
      }
    } catch (error) {
      console.error('Failed to update status', error)
      loadBookings()
    }
  }

  if (loading && bookings.length === 0) return <Loading />

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">จัดการการจอง</h2>
          <p className="text-slate-500 text-sm">ดูแลรายการจองทั้งหมดตามวันที่เลือก</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Date Picker Filter */}
          <div 
            className="relative group cursor-pointer"
            onClick={handleContainerClick}
          >
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-500">
              <Calendar size={16} />
            </div>
            <input 
              ref={dateInputRef}
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm cursor-pointer w-full sm:w-auto"
            />
          </div>

          <div className="flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-2 rounded-xl text-xs font-bold border border-orange-100 shadow-sm">
            <AlertTriangle size={14} />
            <span className="hidden sm:inline">ปล่อยโต๊ะว่างอัตโนมัติ (มาช้า {'>'} 10 นาที)</span>
            <span className="sm:hidden">มาช้า {'>'} 10 นาที</span>
          </div>
        </div>
      </div>

      {loading && <div className="text-center py-10 text-slate-400">กำลังโหลด...</div>}

      <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-5">
        {bookings.map((booking) => (
          <Card key={booking.id} className="overflow-hidden border-slate-100 hover:border-emerald-200 transition-all duration-300 group shadow-md hover:shadow-lg p-0">
            {/* Status Badge - Top Right */}
            <div className="absolute top-2 right-2 z-10">
              {booking.status === 'confirmed' && (
                <div className="bg-emerald-500 w-2 h-2 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.6)]" title="กำลังใช้บริการ" />
              )}
              {booking.status === 'pending' && isLate(booking.startTime, booking.date) && (
                <div className="bg-red-500 w-2 h-2 rounded-full animate-ping" title="มาช้าเกินเวลา" />
              )}
            </div>

            <div className="p-3 sm:p-4 h-full flex flex-col">
              {/* Identity Section */}
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 shrink-0 border border-slate-100">
                  <User size={14} />
                </div>
                <div className="min-w-0">
                  <div className="text-slate-900 font-bold text-xs sm:text-sm truncate leading-tight">
                    {booking.customerName}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate leading-tight">
                    {booking.customerPhone}
                  </div>
                </div>
              </div>

              {/* Info Section */}
              <div className="space-y-2 flex-1 pt-2 border-t border-slate-50">
                <div className="flex items-center gap-1.5 text-slate-600">
                  <Calendar size={12} className="text-emerald-500 shrink-0" />
                  <span className="text-[10px] sm:text-xs font-medium">
                    {new Date(booking.date).toLocaleDateString('th-TH', { 
                      day: 'numeric', month: 'short'
                    })} (วันนี้)
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600">
                  <Clock size={12} className="text-slate-400 shrink-0" />
                  <span className="text-[10px] sm:text-xs font-bold text-slate-900">
                    {booking.startTime} - {booking.endTime}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 pt-1">
                    <TableIcon size={12} className="text-blue-500 shrink-0" />
                    <span className="text-[10px] sm:text-xs font-bold text-slate-700">
                      {booking.tableName?.replace('โต๊ะ ', '') || booking.tableId.slice(0, 4)}
                    </span>
                </div>
                
                {/* Payment Method Indicator */}
                <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-slate-50 mt-2">
                  <div className="flex items-center gap-1.5">
                    {booking.slipUrl ? (
                      <>
                        <FileText size={12} className="text-emerald-500 shrink-0" />
                        <span className="text-[10px] sm:text-xs text-emerald-600 font-medium">โอนจ่าย</span>
                      </>
                    ) : (
                      <>
                        <Store size={12} className="text-blue-500 shrink-0" />
                        <span className="text-[10px] sm:text-xs text-blue-600 font-medium">จ่ายหน้าร้าน</span>
                      </>
                    )}
                  </div>
                  <div className="text-[10px] sm:text-xs font-bold text-emerald-600">
                    ฿{booking.totalPrice}
                  </div>
                </div>
              </div>

              {/* Status/Action Bar */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                {booking.status === 'pending' ? (
                  <div className="flex flex-col gap-1.5">
                    <Button 
                      size="xs" 
                      onClick={() => navigate(`/admin/bookings/${booking.id}`)}
                      className="w-full shadow-emerald-50"
                    >
                      ยืนยันมาถึง
                    </Button>
                    <Button 
                      size="xs" 
                      variant="outline" 
                      className="w-full border-slate-200 text-slate-500 hover:text-red-500 hover:border-red-100 hover:bg-red-50" 
                      onClick={() => handleStatusChange(booking.id, 'no_show')}
                    >
                      ไม่มาตามนัด
                    </Button>
                  </div>
                ) : (
                  <div className={cn(
                    "text-[10px] font-bold text-center py-1 rounded-md",
                    getBookingStatusDisplayClasses(booking.status)
                  )}>
                    {getBookingManagementLabel(booking.status)}
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
        {bookings.length === 0 && (
          <div className="col-span-2 lg:col-span-1 text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
              <ClipboardList size={32} />
            </div>
            <p className="text-slate-400 font-medium">ยังไม่มีรายการจองในขณะนี้</p>
          </div>
        )}
      </div>
    </div>
  )
}

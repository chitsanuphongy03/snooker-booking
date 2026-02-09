import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { Card } from '../../components/ui/Card'
import { Loading } from '../../components/ui/Loading'
import { 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Calendar, 
  MapPin, 
  User, 
  Phone,
  ArrowLeft,
  AlertCircle
} from 'lucide-react'
import { cn } from '../../utils/cn'

interface BookingDetail {
  id: string
  customer_name: string
  customer_phone: string
  date: string
  start_time: string
  end_time: string
  status: string
  total_price: number
  table: {
    name: string
    type: string
  }
}

export function BookingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [booking, setBooking] = useState<BookingDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchBooking() {
      if (!id) {
        setError('ไม่พบรหัสการจอง')
        setLoading(false)
        return
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('bookings')
          .select(`
            id,
            customer_name,
            customer_phone,
            date,
            start_time,
            end_time,
            status,
            total_price,
            table:tables(name, type)
          `)
          .eq('id', id)
          .single()

        if (fetchError) throw fetchError
        if (!data) throw new Error('ไม่พบข้อมูลการจอง')

        setBooking(data as unknown as BookingDetail)
      } catch (err) {
        console.error('Error fetching booking:', err)
        setError('ไม่พบข้อมูลการจอง หรือรหัสการจองไม่ถูกต้อง')
      } finally {
        setLoading(false)
      }
    }

    fetchBooking()
  }, [id])

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'confirmed':
        return { 
          icon: CheckCircle2, 
          color: 'text-emerald-600', 
          bg: 'bg-emerald-50',
          label: 'ยืนยันแล้ว',
          description: 'การจองได้รับการยืนยันเรียบร้อย'
        }
      case 'pending':
        return { 
          icon: Clock, 
          color: 'text-amber-600', 
          bg: 'bg-amber-50',
          label: 'รอยืนยัน',
          description: 'กำลังรอการยืนยันจากทางร้าน'
        }
      case 'completed':
        return { 
          icon: CheckCircle2, 
          color: 'text-blue-600', 
          bg: 'bg-blue-50',
          label: 'เสร็จสิ้น',
          description: 'การใช้บริการเสร็จสิ้นแล้ว'
        }
      case 'cancelled':
        return { 
          icon: XCircle, 
          color: 'text-red-600', 
          bg: 'bg-red-50',
          label: 'ยกเลิก',
          description: 'การจองถูกยกเลิกแล้ว'
        }
      case 'no_show':
        return { 
          icon: AlertCircle, 
          color: 'text-slate-600', 
          bg: 'bg-slate-50',
          label: 'ไม่มาใช้บริการ',
          description: 'ลูกค้าไม่มาตามเวลานัดหมาย'
        }
      default:
        return { 
          icon: Clock, 
          color: 'text-slate-600', 
          bg: 'bg-slate-50',
          label: status,
          description: ''
        }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loading />
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <Card className="max-w-md w-full text-center p-8">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="text-red-500" size={32} />
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">ไม่พบข้อมูลการจอง</h1>
          <p className="text-slate-500 text-sm mb-6">{error}</p>
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium"
          >
            <ArrowLeft size={16} />
            กลับหน้าแรก
          </Link>
        </Card>
      </div>
    )
  }

  const statusConfig = getStatusConfig(booking.status)
  const StatusIcon = statusConfig.icon

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Back Button */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm font-medium"
        >
          <ArrowLeft size={16} />
          กลับหน้าแรก
        </Link>

        {/* Status Card */}
        <Card className={cn("p-6 text-center", statusConfig.bg)}>
          <div className={cn("w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4", statusConfig.bg)}>
            <StatusIcon className={statusConfig.color} size={48} />
          </div>
          <h1 className={cn("text-2xl font-bold mb-1", statusConfig.color)}>
            {statusConfig.label}
          </h1>
          <p className="text-slate-600 text-sm">
            {statusConfig.description}
          </p>
        </Card>

        {/* Booking Details Card */}
        <Card className="p-6 space-y-5">
          <h2 className="text-lg font-bold text-slate-900">รายละเอียดการจอง</h2>

          <div className="space-y-4">
            {/* Table */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
                <MapPin className="text-emerald-600" size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium uppercase">โต๊ะ</p>
                <p className="font-bold text-slate-900">{booking.table?.name || 'N/A'}</p>
                <p className="text-xs text-slate-500 capitalize">{booking.table?.type || ''}</p>
              </div>
            </div>

            {/* Date */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                <Calendar className="text-blue-600" size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium uppercase">วันที่</p>
                <p className="font-bold text-slate-900">
                  {new Date(booking.date).toLocaleDateString('th-TH', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>

            {/* Time */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center shrink-0">
                <Clock className="text-purple-600" size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium uppercase">เวลา</p>
                <p className="font-bold text-slate-900">{booking.start_time} - {booking.end_time}</p>
              </div>
            </div>

            {/* Customer */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center shrink-0">
                <User className="text-orange-600" size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium uppercase">ชื่อผู้จอง</p>
                <p className="font-bold text-slate-900">{booking.customer_name}</p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                <Phone className="text-slate-600" size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium uppercase">เบอร์โทร</p>
                <p className="font-bold text-slate-900">{booking.customer_phone}</p>
              </div>
            </div>
          </div>

          {/* Price */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">ราคารวม</span>
              <span className="text-2xl font-black text-emerald-600">
                {booking.total_price.toLocaleString()} ฿
              </span>
            </div>
          </div>
        </Card>

        {/* Booking ID */}
        <div className="text-center">
          <p className="text-xs text-slate-400">รหัสการจอง</p>
          <p className="font-mono text-xs text-slate-500">{booking.id}</p>
        </div>
      </div>
    </div>
  )
}

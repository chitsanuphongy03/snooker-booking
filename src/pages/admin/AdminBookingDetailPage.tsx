import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Loading } from '../../components/ui/Loading'
import { Modal } from '../../components/ui/Modal'
import { useAlert } from '../../hooks/useAlert'
import { 
  Clock, 
  XCircle, 
  Calendar, 
  MapPin, 
  ArrowLeft,
  QrCode,
  CheckCircle,
  AlertTriangle,
  Store
} from 'lucide-react'
import { cn } from '../../utils/cn'
import { updateBookingStatus, updateTableStatus } from '../../services/bookingService'

interface BookingDetail {
  id: string
  customer_name: string
  customer_phone: string
  date: string
  start_time: string
  end_time: string
  status: string
  total_price: number
  slip_url?: string
  table_id: string
  table: {
    name: string
    type: string
  }
}

export function AdminBookingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showAlert } = useAlert()
  
  const [booking, setBooking] = useState<BookingDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  
  // Modal states
  const [showCheckInModal, setShowCheckInModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)

  useEffect(() => {
    async function fetchBooking() {
      if (!id) return

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
            slip_url,
            table_id,
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

  const onConfirmCheckIn = async () => {
    if (!booking) return
    
    setProcessing(true)
    try {
      // 1. Update Booking Status -> confirmed
      await updateBookingStatus(booking.id, 'confirmed')
      
      // 2. Update Table Status -> occupied
      await updateTableStatus(booking.table_id, 'occupied')

      // Refresh data
      const { data } = await supabase
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
          table_id,
          table:tables(name, type)
        `)
        .eq('id', booking.id)
        .single()
        
      if (data) setBooking(data as unknown as BookingDetail)
      
      showAlert({
        title: 'สำเร็จ',
        message: 'ยืนยันลูกค้าเข้าใช้บริการเรียบร้อยแล้ว',
        type: 'success'
      })
      setShowCheckInModal(false)
    } catch (err) {
      console.error('Error confirming booking:', err)
      showAlert({
        title: 'ผิดพลาด',
        message: 'เกิดข้อผิดพลาดในการยืนยัน กรุณาลองใหม่',
        type: 'error'
      })
    } finally {
      setProcessing(false)
    }
  }

  const onConfirmCancel = async () => {
    if (!booking) return

    setProcessing(true)
    try {
      await updateBookingStatus(booking.id, 'cancelled')
       // Refresh data
       const { data } = await supabase
       .from('bookings')
       .select('status')
       .eq('id', booking.id)
       .single()
       
      if (data) setBooking(prev => prev ? ({ ...prev, status: data.status }) : null)
      
      showAlert({
        title: 'สำเร็จ',
        message: 'ยกเลิกการจองเรียบร้อยแล้ว',
        type: 'success'
      })
      setShowCancelModal(false)
    } catch (err) {
      console.error('Error cancelling booking:', err)
      showAlert({
        title: 'ผิดพลาด',
        message: 'เกิดข้อผิดพลาดในการยกเลิก',
        type: 'error'
      })
    } finally {
      setProcessing(false)
    }
  }

  if (loading) return <Loading />

  if (error || !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <Card className="max-w-md w-full text-center p-8">
          <XCircle className="text-red-500 mx-auto mb-4" size={48} />
          <h1 className="text-xl font-bold mb-2">ไม่พบข้อมูล</h1>
          <p className="text-slate-500 mb-6">{error}</p>
          <Button onClick={() => navigate('/admin')}>กลับหน้าหลัก</Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in zoom-in duration-300 max-w-lg mx-auto pb-28">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/admin')}>
            <ArrowLeft size={20} />
        </Button>
        <h1 className="text-xl font-bold">ตรวจสอบการจอง</h1>
      </div>

      <Card className="p-6 text-center space-y-4 shadow-lg border-emerald-100">
         <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600">
            <QrCode size={40} />
         </div>
         <div>
            <h2 className="text-2xl font-bold text-slate-900">{booking.customer_name}</h2>
            <p className="text-slate-500">{booking.customer_phone}</p>
         </div>
         
         {/* Status Badge */}
         <div className="flex justify-center">
            <span className={cn(
                "px-3 py-1 rounded-full text-sm font-bold",
                booking.status === 'confirmed' ? "bg-emerald-100 text-emerald-700" :
                booking.status === 'pending' ? "bg-orange-100 text-orange-700" :
                "bg-slate-100 text-slate-700"
            )}>
                {booking.status === 'confirmed' ? 'ยืนยันแล้ว (เข้าใช้งาน)' :
                 booking.status === 'pending' ? 'รอยืนยัน' : booking.status}
            </span>
         </div>
      </Card>

      <Card className="p-6 space-y-4">
         <h3 className="font-bold text-lg">รายละเอียด</h3>
         <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="text-slate-500 flex items-center gap-2"><MapPin size={16}/> โต๊ะ</span>
                <span className="font-bold">{booking.table?.name} ({booking.table?.type})</span>
            </div>
            <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="text-slate-500 flex items-center gap-2"><Calendar size={16}/> วันที่</span>
                <span className="font-bold">
                    {new Date(booking.date).toLocaleDateString('th-TH', { dateStyle: 'long' })}
                </span>
            </div>
            <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="text-slate-500 flex items-center gap-2"><Clock size={16}/> เวลา</span>
                <span className="font-bold text-emerald-600 text-base">{booking.start_time} - {booking.end_time}</span>
            </div>
            <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="text-slate-500 flex items-center gap-2"><Store size={16}/> การชำระเงิน</span>
                <span className={cn(
                    "font-bold", 
                    !booking.slip_url ? "text-blue-600" : "text-emerald-600"
                )}>
                    {booking.slip_url ? 'โอนจ่าย (แนบสลีป)' : 'ชำระเงินหน้าเคาน์เตอร์'}
                </span>
            </div>
            <div className="flex justify-between pt-2">
                <span className="text-slate-500 font-bold">ยอดรวม</span>
                <span className="font-black text-xl text-emerald-600">{booking.total_price.toLocaleString()} ฿</span>
            </div>
         </div>
      </Card>

      {/* Payment Slip */}
      {booking.slip_url && (
        <Card className="p-6 space-y-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <span className="text-emerald-600">💸</span> หลักฐานการโอนเงิน
          </h3>
          <div className="rounded-xl overflow-hidden border border-slate-100 bg-slate-50">
            <img 
              src={booking.slip_url} 
              alt="Payment Slip" 
              className="w-full h-auto object-contain max-h-96"
            />
          </div>
          <div className="text-center">
            <a 
              href={booking.slip_url} 
              target="_blank" 
              rel="noreferrer"
              className="text-sm text-emerald-600 hover:underline"
            >
              ดูรูปขนาดเต็ม
            </a>
          </div>
        </Card>
      )}

      {/* Actions */}
      {booking.status === 'pending' && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-100 flex gap-3 z-60 md:static md:bg-transparent md:border-0 md:p-0">
            <Button 
                className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border-red-200 py-3" 
                variant="outline"
                onClick={() => setShowCancelModal(true)}
                disabled={processing}
            >
                ยกเลิก/ไม่มา
            </Button>
            <Button 
                className="flex-2 py-3 shadow-emerald-200 shadow-lg text-base" 
                onClick={() => setShowCheckInModal(true)}
                disabled={processing}
            >
                ยืนยันลูกค้ามาถึง (Check-in)
            </Button>
          </div>
      )}

      {/* Check In Modal */}
      <Modal
        isOpen={showCheckInModal}
        onClose={() => setShowCheckInModal(false)}
        title="ยืนยันการเช็คอิน"
      >
        <div className="space-y-4">
            <div className="flex flex-col items-center justify-center p-4 bg-emerald-50 rounded-xl text-emerald-600 mb-2">
                <CheckCircle size={48} className="mb-2" />
                <p className="font-bold text-lg">ยืนยันลูกค้าเข้าใช้บริการ?</p>
                <p className="text-sm text-emerald-500/80 mt-1">สถานะจะเปลี่ยนเป็น "กำลังใช้งาน"</p>
            </div>
            <div className="flex gap-3">
                <Button 
                    variant="outline" 
                    className="flex-1" 
                    onClick={() => setShowCheckInModal(false)}
                >
                    ยกเลิก
                </Button>
                <Button 
                    className="flex-1" 
                    onClick={onConfirmCheckIn}
                    disabled={processing}
                >
                    {processing ? 'กำลังบันทึก...' : 'ยืนยัน'}
                </Button>
            </div>
        </div>
      </Modal>

      {/* Cancel Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="ยืนยันการยกเลิก"
      >
        <div className="space-y-4">
            <div className="flex flex-col items-center justify-center p-4 bg-red-50 rounded-xl text-red-600 mb-2">
                <AlertTriangle size={48} className="mb-2" />
                <p className="font-bold text-lg">ยืนยันการยกเลิกการจอง?</p>
                <p className="text-sm text-red-500/80 mt-1">การดำเนินการนี้ไม่สามารถย้อนกลับได้</p>
            </div>
            <div className="flex gap-3">
                <Button 
                    variant="outline" 
                    className="flex-1" 
                    onClick={() => setShowCancelModal(false)}
                >
                    ยกเลิก
                </Button>
                <Button 
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white" 
                    onClick={onConfirmCancel}
                    disabled={processing}
                >
                    {processing ? 'กำลังบันทึก...' : 'ยืนยันการยกเลิก'}
                </Button>
            </div>
        </div>
      </Modal>
    </div>
  )
}

import { useState } from 'react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Search, Phone, Calendar, Clock, CheckCircle2, XCircle, Timer, AlertCircle, CheckCircle, Ticket } from 'lucide-react'
import type { Booking } from '../../types'
import { getBookingsByPhone, updateBookingStatus, getTableById } from '../../services/bookingService'
import { Modal } from '../../components/ui/Modal'
import { BookingSlip } from '../../components/ui/BookingSlip'
import { useAlert } from '../../hooks/useAlert'
import { getBookingStatusColor, getBookingStatusLabel } from '../../utils/statusUtils'

export function BookingStatusPage() {
  const [phone, setPhone] = useState('')
  const { showAlert } = useAlert()
  const [foundBooking, setFoundBooking] = useState<Booking | null>(null)
  const [tableName, setTableName] = useState<string>('')
  const [searched, setSearched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setSearched(true)
    setLoading(true)
    setFoundBooking(null) // Reset logic
    setTableName('')
    
    try {
      const bookings = await getBookingsByPhone(phone.replace(/-/g, ''))
      // For MVP, we just take the latest one or logic to pick active.
      // Let's pick the first one which is latest due to order by created_at desc
      const booking = bookings[0] || null
      setFoundBooking(booking)

      if (booking) {
        const table = await getTableById(booking.tableId)
        if (table) {
            setTableName(table.name)
        }
      }
    } finally {
      setLoading(false)
    }
  }



  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle2 size={16} />
      case 'pending': return <Timer size={16} />
      case 'cancelled': return <XCircle size={16} />
      default: return null
    }
  }

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  const [isSlipModalOpen, setIsSlipModalOpen] = useState(false)

  const handleCancel = async () => {
    if (!foundBooking) return
    
    setCancelling(true)
    try {
        await updateBookingStatus(foundBooking.id, 'cancelled')
        setFoundBooking(prev => prev ? { ...prev, status: 'cancelled' } : null)
        setIsCancelModalOpen(false)
        setIsSuccessModalOpen(true)
    } catch {
        showAlert({
            title: 'ผิดพลาด',
            message: 'ไม่สามารถยกเลิกการจองได้ในขณะนี้ กรุณาลองใหม่อีกครั้งหรือติดต่อเจ้าหน้าที่',
            type: 'error'
        })
    } finally {
        setCancelling(false)
    }
  }

  return (
    <div className="max-w-md mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-slate-900">ตรวจสอบการจอง</h2>
        <p className="text-slate-500 text-sm">ค้นหาประวัติการจองของคุณด้วยเบอร์โทรศัพท์</p>
      </div>

      <Card>
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Phone size={16} /> เบอร์โทรศัพท์ที่ใช้จอง
            </label>
            <div className="flex gap-2">
              <Input 
                required
                type="tel"
                pattern="[0-9]{9,10}"
                title="กรุณากรอกเบอร์โทร 9-10 หลัก"
                placeholder="08X-XXX-XXXX" 
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
              />
              <Button type="submit" disabled={loading}>
                {loading ? <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" /> : <Search size={18} />}
              </Button>
            </div>
            <p className="text-[10px] text-slate-400 text-center mt-2 italic">
              * ลองใช้เบอร์ทดสอบ: 0812345678 หรือ 0987654321
            </p>
          </div>
        </form>
      </Card>

      {searched && (
        foundBooking ? (
          <Card className="animate-in fade-in slide-in-from-top-2">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">โต๊ะที่จอง</span>
                  <p className="text-sm font-bold text-slate-900">
                    {tableName || 'N/A'}
                  </p>
                </div>
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wide ${getBookingStatusColor(foundBooking.status)}`}>
                  {getStatusIcon(foundBooking.status)}
                  {getBookingStatusLabel(foundBooking.status)}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 py-4 border-y border-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">วันที่</p>
                    <p className="text-sm font-semibold">{foundBooking.date}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Clock size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">เวลา</p>
                    <p className="text-sm font-semibold">{foundBooking.startTime} - {foundBooking.endTime} น.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">ราคาที่ต้องจ่าย (หน้าร้าน)</span>
                  <span className="text-lg font-bold text-emerald-600">{foundBooking.totalPrice} บาท</span>
                </div>
                
                {(foundBooking.status === 'confirmed' || foundBooking.status === 'pending') && (
                  <div className="grid grid-cols-1 gap-2">
                    <Button 
                      className="w-full gap-2"
                      onClick={() => setIsSlipModalOpen(true)}
                    >
                      <Ticket size={18} /> ดูสลีปการจอง (QR)
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full text-red-500 border-red-100 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                      onClick={() => setIsCancelModalOpen(true)}
                    >
                      ยกเลิกการจอง
                    </Button>
                  </div>
                )}

                <p className="text-[10px] text-slate-400 text-center">
                  * กรุณามาถึงก่อนเวลา 10 นาที หากช้าเกิน 10 นาที โต๊ะจะถูกปล่อยอัตโนมัติ
                </p>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="text-center py-10 space-y-2 animate-in fade-in slide-in-from-top-2">
            <p className="text-slate-400">ไม่พบข้อมูลการจองสำหรับเบอร์นี้</p>
            <p className="text-sm text-slate-500">ตรวจสอบเบอร์โทรศัพท์อีกครั้ง หรือลองจองใหม่</p>
          </Card>
        )
      )}

      {/* Cancellation Confirmation Modal */}
      <Modal 
        isOpen={isCancelModalOpen} 
        onClose={() => setIsCancelModalOpen(false)}
        title="ยืนยันการยกเลิก"
      >
        <div className="space-y-6 text-center">
          <div className="mx-auto w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center">
            <AlertCircle size={32} />
          </div>
          <div className="space-y-2">
            <p className="text-slate-900 font-bold text-lg">คุณแน่ใจหรือไม่?</p>
            <p className="text-slate-500 text-sm">การยกเลิกจองจะไม่สามารถกู้คืนได้ คุณต้องการดำเนินการต่อใช่หรือไม่?</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={() => setIsCancelModalOpen(false)} disabled={cancelling}>
              ไม่ใช่, ย้อนกลับ
            </Button>
            <Button className="bg-red-500 hover:bg-red-600 border-red-500" onClick={handleCancel} disabled={cancelling}>
              {cancelling ? <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" /> : 'ใช่, ยกเลิกการจอง'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Success Modal */}
      <Modal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title="สำเร็จ"
      >
        <div className="space-y-6 text-center">
          <div className="mx-auto w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center">
            <CheckCircle size={32} />
          </div>
          <div className="space-y-2">
            <p className="text-slate-900 font-bold text-lg">ยกเลิกการจองเรียบร้อยแล้ว</p>
            <p className="text-slate-500 text-sm">ระบบได้ทำการยกเลิกรายการจองของคุณแล้วครับ</p>
          </div>
          <Button className="w-full" onClick={() => setIsSuccessModalOpen(false)}>
            ตกลง
          </Button>
        </div>
      </Modal>

      {/* Booking Slip Modal */}
      <Modal
        isOpen={isSlipModalOpen}
        onClose={() => setIsSlipModalOpen(false)}
        title="สลีปการจอง"
        className="max-w-sm"
      >
        <div className="space-y-6">
          {foundBooking && <BookingSlip booking={foundBooking} tableName={tableName} />}
          <Button className="w-full" onClick={() => setIsSlipModalOpen(false)}>
            ปิดหน้าต่าง
          </Button>
        </div>
      </Modal>
    </div>
  )
}

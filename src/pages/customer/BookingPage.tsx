import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { getTableById, createBooking, getSettings, getBookingsByTableAndDate, uploadSlip } from '../../services/bookingService'
import { useState, useEffect } from 'react'
import { ChevronLeft, Calendar as CalendarIcon, Clock, User, Phone, CheckCircle as CheckCircleIcon } from 'lucide-react'
import { cn } from '../../utils/cn'
import { Modal } from '../../components/ui/Modal'
import { BookingSlip } from '../../components/ui/BookingSlip'
import type { Booking, Table } from '../../types'
import { useAlert } from '../../hooks/useAlert'

export function BookingPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { showAlert } = useAlert()
  const [searchParams] = useSearchParams()
  const [table, setTable] = useState<Table | null>(null)
  
  const initialTime = searchParams.get('startTime') || ''
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    date: new Date().toISOString().split('T')[0],
    startTime: initialTime,
    duration: '1',
    slipFile: null as File | null,
    paymentMethod: 'shop' as 'shop' | 'transfer'
  })

  const [shopQrUrl, setShopQrUrl] = useState<string | null>(null)

  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(false)
  const [timeSlots, setTimeSlots] = useState<string[]>([])

  const generateTimeSlots = (open: string, close: string, selectedDate: string) => {
    const slots: string[] = []
    const [h, m] = open.split(':').map(Number)
    const [endH, endM] = close.split(':').map(Number)
    
    // Get current time for comparison if date is today
    const now = new Date()
    const isToday = selectedDate === now.toISOString().split('T')[0]
    const currentHour = now.getHours()
    const currentMin = now.getMinutes()

    // Handle overnight closing (e.g., 02:00)
    let currentTotal = h * 60 + m
    let endTotal = endH * 60 + endM
    if (endTotal <= currentTotal) endTotal += 24 * 60

    while (currentTotal <= endTotal - 30) {
      const slotH = Math.floor(currentTotal / 60) % 24
      const slotM = currentTotal % 60
      const timeStr = `${String(slotH).padStart(2, '0')}:${String(slotM).padStart(2, '0')}`
      
      // If today, only show future slots
      if (isToday) {
        if (currentTotal > (currentHour * 60 + currentMin)) {
          slots.push(timeStr)
        }
      } else {
        slots.push(timeStr)
      }
      
      currentTotal += 30
    }
    return slots
  }

  useEffect(() => {
    const loadData = async () => {
      if (id) {
        const tableData = await getTableById(id)
        setTable(tableData)
        
        const settings = await getSettings()
        if (settings) {
          setShopQrUrl(settings.payment_qr_url || null)
          const baseSlots = generateTimeSlots(settings.open_time, settings.close_time, formData.date)
          
          // Fetch existing bookings for this table and date
          const existingBookings = await getBookingsByTableAndDate(id, formData.date)
          
          // Filter out occupied slots
          const filteredSlots = baseSlots.filter(slot => {
            const [slotH, slotM] = slot.split(':').map(Number)
            const slotTotal = slotH * 60 + slotM
            
            // Check if ANY existing booking overlaps with this specific 30-min slot
            const isOccupied = existingBookings.some(b => {
              const [startH, startM] = b.startTime.split(':').map(Number)
              const [endH, endM] = b.endTime.split(':').map(Number)
              const startTotal = startH * 60 + startM
              let endTotal = endH * 60 + endM
              
              // Handle overnight bookings if any (though usually they stay within one date field or split)
              // For now assume they are within the same day or handled by the query
              if (endTotal <= startTotal) endTotal += 24 * 60
              
              return slotTotal >= startTotal && slotTotal < endTotal
            })
            
            return !isOccupied
          })

          setTimeSlots(filteredSlots)
          
          // If current startTime is not in slots anymore (e.g. date changed or time passed), reset it
          if (formData.startTime && !filteredSlots.includes(formData.startTime)) {
            setFormData(prev => ({ ...prev, startTime: '' }))
          }
        }
      }
    }
    loadData()
  }, [id, formData.date, formData.startTime])

  if (!table) return <div className="p-8 text-center text-slate-500">กำลังโหลดข้อมูล...</div>

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Frontend validation
    if (formData.name.trim().length < 2) {
      showAlert({ title: 'กรุณาตรวจสอบข้อมูล', message: 'ชื่อผู้จองต้องมีอย่างน้อย 2 ตัวอักษร', type: 'error' })
      return
    }

    const phoneDigits = formData.phone.replace(/\D/g, '')
    if (phoneDigits.length < 9 || phoneDigits.length > 10) {
      showAlert({ title: 'กรุณาตรวจสอบข้อมูล', message: 'เบอร์โทรศัพท์ต้องมี 9-10 หลัก', type: 'error' })
      return
    }

    if (!formData.startTime) {
      showAlert({ title: 'กรุณาตรวจสอบข้อมูล', message: 'กรุณาเลือกเวลาเริ่มเล่น', type: 'error' })
      return
    }

    setLoading(true)
    
    // Calculate endTime
    const [startH, startM] = formData.startTime.split(':').map(Number)
    const duration = Number(formData.duration)
    const endTotalMins = (startH * 60) + startM + (duration * 60)
    const endH = Math.floor(endTotalMins / 60) % 24
    const endM = endTotalMins % 60
    const endTime = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`

    try {
      let slipUrl = undefined
      if (formData.slipFile) {
        slipUrl = await uploadSlip(formData.slipFile)
      }

      const newBooking = await createBooking({
        tableId: id || '1',
        customerName: formData.name,
        customerPhone: formData.phone,
        date: formData.date,
        startTime: formData.startTime,
        endTime: endTime,
        status: 'pending', // Default to pending
        totalPrice: table ? table.pricePerHour * duration : 0,
        slipUrl: slipUrl
      })
      
      setConfirmedBooking(newBooking)
      setIsSuccessModalOpen(true)
    } catch (error) {
      console.error(error)
      showAlert({
        title: 'เกิดข้อผิดพลาด',
        message: 'เกิดข้อผิดพลาดในการจอง กรุณาลองใหม่อีกครั้ง',
        type: 'error'
      })
    } finally {
      setLoading(false)
    }
  }



  // Success modal shouldn't be closeable by clicking outside
  const handleModalClose = () => {
    // Do nothing - force user to click "กลับหน้าหลัก"
  }

  return (
    <div className="max-w-md mx-auto space-y-6 animate-in slide-in-from-right-4 duration-500">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-colors"
      >
        <ChevronLeft size={20} />
        <span>กลับไปที่รายการโต๊ะ</span>
      </button>

      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-slate-900">ยืนยันการจอง</h2>
        <p className="text-slate-500 text-sm">คุณกำลังจะจอง {table.name}</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <User size={16} /> ชื่อผู้จอง
            </label>
            <Input 
              required
              minLength={2}
              maxLength={50}
              title="กรุณากรอกชื่ออย่างน้อย 2 ตัวอักษร"
              placeholder="กรุณากรอกชื่อของคุณ" 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Phone size={16} /> เบอร์โทรศัพท์
            </label>
            <Input 
              required
              type="tel"
              pattern="[0-9]{9,10}"
              title="กรุณากรอกเบอร์โทร 9-10 หลัก"
              placeholder="08X-XXX-XXXX" 
              value={formData.phone}
              onChange={e => setFormData({...formData, phone: e.target.value.replace(/[^0-9-]/g, '')})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <CalendarIcon size={16} /> วันที่
              </label>
              <Input 
                required
                type="date"
                min={new Date().toISOString().split('T')[0]}
                max={(() => {
                  const maxDate = new Date()
                  maxDate.setDate(maxDate.getDate() + 7)
                  return maxDate.toISOString().split('T')[0]
                })()}
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
              />
            </div>
            <div className="space-y-2 col-span-2">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Clock size={16} /> เลือกเวลาเริ่ม
              </label>
              
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-48 overflow-y-auto p-1 border border-slate-100 rounded-xl bg-slate-50/30">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, startTime: time }))}
                    className={cn(
                      "py-2 rounded-lg text-xs font-bold border transition-all",
                      formData.startTime === time
                        ? "bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-100 scale-105 z-10"
                        : "bg-white border-slate-200 text-slate-600 hover:border-emerald-600 hover:text-emerald-600"
                    )}
                  >
                    {time}
                  </button>
                ))}
              </div>
              {!formData.startTime && (
                <p className="text-[11px] text-red-400 font-medium">กรุณาเลือกเวลาเริ่มเล่น</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">ชั่วโมงที่จะเล่น (ชม.)</label>
            <select 
              className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all font-medium"
              value={formData.duration}
              onChange={e => setFormData({...formData, duration: e.target.value})}
            >
              {[1, 2, 3, 4, 5].map(h => (
                <option key={h} value={h}>{h} ชม.</option>
              ))}
            </select>
          </div>

          <div className="space-y-3 pt-2 border-t border-slate-100">
            <label className="text-sm font-bold text-slate-700">วิธีการชำระเงิน</label>
            
            <div className="grid grid-cols-2 gap-3">
              <label className={cn(
                "flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all",
                formData.paymentMethod === 'shop' 
                  ? "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm" 
                  : "bg-white border-slate-200 text-slate-600 hover:border-emerald-200"
              )}>
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  value="shop"
                  checked={formData.paymentMethod === 'shop'}
                  onChange={() => setFormData(prev => ({ ...prev, paymentMethod: 'shop' }))}
                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-sm font-bold">จ่ายหน้าร้าน</span>
              </label>

              <label className={cn(
                "flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all",
                formData.paymentMethod === 'transfer' 
                  ? "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm" 
                  : "bg-white border-slate-200 text-slate-600 hover:border-emerald-200"
              )}>
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  value="transfer"
                  checked={formData.paymentMethod === 'transfer'}
                  onChange={() => setFormData(prev => ({ ...prev, paymentMethod: 'transfer' }))}
                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-sm font-bold">โอนจ่ายตอนนี้</span>
              </label>
            </div>
          </div>

          {formData.paymentMethod === 'transfer' && (
            <div className="space-y-4 pt-2 animate-in slide-in-from-top-2 duration-300">
              {shopQrUrl && (
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center space-y-2">
                  <p className="text-sm font-bold text-slate-700">สแกนจ่ายเงิน</p>
                  <div className="w-48 h-48 mx-auto bg-slate-100 rounded-lg overflow-hidden">
                    <img src={shopQrUrl} alt="Shop QR" className="w-full h-full object-contain" />
                  </div>
                  <p className="text-xs text-slate-500">บัญชีร้าน: Snooker Club</p>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <span className="text-emerald-600">💸</span> แนบสลีปโอนเงิน
                </label>
                <Input 
                  type="file"
                  accept="image/*"
                  required={formData.paymentMethod === 'transfer'}
                  className="h-auto py-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                  onChange={e => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setFormData(prev => ({ ...prev, slipFile: file }))
                    }
                  }}
                />
                <p className="text-[10px] text-slate-400">
                  * กรุณาแนบสลีปเพื่อยืนยันการจอง
                </p>
              </div>
            </div>
          )}

          <Card.Footer className="px-0">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-500">รวมราคาประมาณการ</span>
              <span className="text-xl font-bold text-emerald-600">
                {table.pricePerHour * Number(formData.duration)} บาท
              </span>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'กำลังยืนยัน...' : 'ยืนยันการจอง'}
            </Button>
            <p className="text-[10px] text-slate-400 text-center mt-4">
              * กรุณามาถึงก่อนเวลา 10 นาที หากช้าเกิน 10 นาที โต๊ะจะถูกปล่อยอัตโนมัติ
            </p>
          </Card.Footer>
        </form>
      </Card>

      <Modal
        isOpen={isSuccessModalOpen}
        onClose={handleModalClose}
        title="จองสำเร็จ!"
        className="max-w-sm"
      >
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-green-50 text-green-500 rounded-full flex items-center justify-center">
              <CheckCircleIcon size={24} />
            </div>
            <p className="text-slate-900 font-bold text-lg">ยืนยันการจองเรียบร้อย!</p>
          </div>
          
          {confirmedBooking && <BookingSlip booking={confirmedBooking} tableName={table.name} />}

          <Button className="w-full" onClick={() => navigate('/')}>
            กลับหน้าหลัก
          </Button>
        </div>
      </Modal>
    </div>
  )
}

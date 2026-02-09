import { useRef } from 'react'
import { toPng } from 'html-to-image'
import { Calendar, Clock, MapPin, Hash, Download } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { cn } from '../../utils/cn'
import type { Booking } from '../../types'

interface BookingSlipProps {
  booking: Booking
  tableName?: string
  className?: string
}

export function BookingSlip({ booking, tableName, className }: BookingSlipProps) {
  const slipRef = useRef<HTMLDivElement>(null)
  
  // QR Code now links to check-in page
  const qrData = `${window.location.origin}/booking/${booking.id}`

  const handleDownload = async () => {
    if (slipRef.current === null) return
    
    try {
      const dataUrl = await toPng(slipRef.current, { cacheBust: true })
      const link = document.createElement('a')
      link.download = `booking-slip-${booking.id}.png`
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error('oops, something went wrong!', err)
      alert('ไม่สามารถบันทึกภาพได้ในขณะนี้')
    }
  }

  return (
    <div className="space-y-6">
      <div 
        ref={slipRef}
        className={cn("bg-white p-5 rounded-3xl border border-slate-100 relative overflow-hidden mx-auto", className)}
        style={{ maxWidth: '320px' }}
      >
        {/* Decorative receipt edge */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-emerald-600" />
        
        <div className="space-y-4 pt-2">
          <div className="text-center space-y-1">
            <h3 className="text-base font-black text-slate-900 uppercase tracking-tighter">SNOOKER BOOKING</h3>
            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-[0.3em]">Digital Receipt • Official</p>
          </div>

          <div className="flex justify-center p-2.5 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
             <div className="p-1.5 bg-white rounded-xl shadow-sm">
               <QRCodeSVG 
                 value={qrData} 
                 size={112}
                 level="M"
                 includeMargin={false}
               />
             </div>
          </div>

          <div className="grid grid-cols-2 gap-y-3 px-1">
            <div className="space-y-0.5">
              <span className="flex items-center gap-1 text-[8px] text-slate-400 font-bold uppercase">
                <Hash size={9} /> ID
              </span>
              <p className="text-xs font-mono font-bold text-slate-800">{booking.id}</p>
            </div>
            <div className="space-y-0.5">
              <span className="flex items-center gap-1 text-[8px] text-slate-400 font-bold uppercase">
                <MapPin size={9} /> Table
              </span>
              <p className="text-xs font-bold text-slate-900">{tableName || 'N/A'}</p>
            </div>
            <div className="space-y-0.5">
              <span className="flex items-center gap-1 text-[8px] text-slate-400 font-bold uppercase">
                <Calendar size={9} /> Date
              </span>
              <p className="text-xs font-bold text-slate-800">{booking.date}</p>
            </div>
            <div className="space-y-0.5">
              <span className="flex items-center gap-1 text-[8px] text-slate-400 font-bold uppercase">
                <Clock size={9} /> Time
              </span>
              <p className="text-xs font-bold text-slate-800">{booking.startTime} - {booking.endTime}</p>
            </div>
          </div>

          <div className="pt-4 border-t border-dashed border-slate-200 space-y-3 px-1">
            <div className="flex justify-between items-center">
               <div className="space-y-0.5">
                  <span className="text-[8px] text-slate-400 font-bold uppercase">Customer</span>
                  <p className="text-xs font-bold text-slate-800">{booking.customerName}</p>
               </div>
               <div className="text-right">
                  <span className="text-[8px] text-slate-400 font-bold uppercase block mb-0.5">Total</span>
                  <span className="text-xl font-black text-emerald-600 leading-none">{booking.totalPrice} ฿</span>
               </div>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center">
          <p className="text-[8px] text-slate-300 font-medium leading-relaxed uppercase tracking-widest">
            Thank you for playing
          </p>
        </div>

        {/* Side punch holes effect */}
        <div className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-5 h-5 bg-white sm:bg-slate-50 rounded-full border border-slate-100 hidden sm:block" />
        <div className="absolute -right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 bg-white sm:bg-slate-50 rounded-full border border-slate-100 hidden sm:block" />
      </div>

      <button
        onClick={handleDownload}
        className="w-full flex items-center justify-center gap-2 py-3 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-xl text-xs font-bold transition-all border border-slate-100"
      >
        <Download size={16} />
        บันทึกภาพสลีปลงเครื่อง
      </button>
    </div>
  )
}

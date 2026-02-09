import { useState, useEffect } from 'react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Clock, DollarSign, ShieldCheck, Save, Store } from 'lucide-react'
import { getSettings, updateSettings, uploadShopQR } from '../../services/bookingService'
import { useAlert } from '../../hooks/useAlert'
import { Loading } from '../../components/ui/Loading'

export function Settings() {
  const [loading, setLoading] = useState(true)
  const [settingsId, setSettingsId] = useState<string>('')
  
  const [shopName, setShopName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [openTime, setOpenTime] = useState('')
  const [closeTime, setCloseTime] = useState('')
  const [standardPrice, setStandardPrice] = useState('')
  const [vipPrice, setVipPrice] = useState('')
  const [lateThreshold, setLateThreshold] = useState('')
  const [paymentQrUrl, setPaymentQrUrl] = useState('')
  const [qrFile, setQrFile] = useState<File | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const { showAlert } = useAlert()

  useEffect(() => {
    getSettings().then(data => {
      if (data) {
        setSettingsId(data.id)
        setShopName(data.shop_name)
        setPhone(data.phone)
        setAddress(data.address)
        setOpenTime(data.open_time)
        setCloseTime(data.close_time)
        setStandardPrice(String(data.standard_price))
        setVipPrice(String(data.vip_price))
        setLateThreshold(String(data.late_threshold_minutes))
        setPaymentQrUrl(data.payment_qr_url || '')
      }
      setLoading(false)
    })
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      let finalQrUrl = paymentQrUrl

      if (qrFile) {
        finalQrUrl = await uploadShopQR(qrFile)
        setPaymentQrUrl(finalQrUrl) // Update state for preview
      }

      await updateSettings({
        id: settingsId, // Include ID to be safe if updateSettings uses it
        shop_name: shopName,
        phone,
        address,
        open_time: openTime,
        close_time: closeTime,
        standard_price: Number(standardPrice),
        vip_price: Number(vipPrice),
        late_threshold_minutes: Number(lateThreshold),
        payment_qr_url: finalQrUrl
      })
      showAlert({
        title: 'สำเร็จ',
        message: 'บันทึกการตั้งค่าร้านค้าเรียบร้อยแล้ว',
        type: 'success'
      })
      setQrFile(null) // Reset file input
    } catch (error) {
      console.error(error)
      showAlert({
        title: 'ผิดพลาด',
        message: 'เกิดข้อผิดพลาดในการบันทึก กรุณาลองใหม่อีกครั้ง',
        type: 'error'
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) return <Loading />

  return (
    <div className="max-w-4xl space-y-6 animate-in slide-in-from-right-4 duration-500 pb-12">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-slate-900">ตั้งค่าร้าน</h2>
          <p className="text-slate-500 text-sm">จัดการข้อมูลพื้นฐาน เวลาทำการ และราคาค่าบริการ</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="shadow-lg shadow-emerald-100">
          {isSaving ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
          ) : (
            <Save size={18} className="mr-2" />
          )}
          บันทึกทั้งหมด
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Info */}
        <Card className="space-y-6">
          <div className="flex items-center gap-3 pb-2 border-b border-slate-50">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Store size={20} />
            </div>
            <h3 className="font-bold text-slate-900">ข้อมูลพื้นฐาน</h3>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                ชื่อร้าน
              </label>
              <Input 
                value={shopName} 
                onChange={e => setShopName(e.target.value)} 
                placeholder="ชื่อร้านของคุณ"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                เบอร์โทรศัพท์
              </label>
              <Input 
                value={phone} 
                onChange={e => setPhone(e.target.value)} 
                placeholder="02-XXX-XXXX"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">
                ที่ตั้งร้าน
              </label>
              <textarea 
                className="w-full min-h-[80px] rounded-lg border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"
                value={address}
                onChange={e => setAddress(e.target.value)}
              />
            </div>
          </div>
        </Card>

        {/* Business Hours */}
        <Card className="space-y-6">
          <div className="flex items-center gap-3 pb-2 border-b border-slate-50">
            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
              <Clock size={20} />
            </div>
            <h3 className="font-bold text-slate-900">เวลาทำการ</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">เวลาเปิด</label>
              <Input type="time" value={openTime} onChange={e => setOpenTime(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">เวลาปิด</label>
              <Input type="time" value={closeTime} onChange={e => setCloseTime(e.target.value)} />
            </div>
          </div>
          
          <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <p className="text-xs text-slate-500 leading-relaxed italic">
              * เวลาทำการจะถูกนำไปใช้ในหน้าจองของลูกค้า เพื่อจำกัดช่วงเวลาการเลือกโต๊ะ
            </p>
          </div>
        </Card>

        {/* Pricing */}
        <Card className="space-y-6">
          <div className="flex items-center gap-3 pb-2 border-b border-slate-50">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <DollarSign size={20} />
            </div>
            <h3 className="font-bold text-slate-900">อัตราค่าบริการ</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
              <div className="space-y-0.5">
                <span className="text-sm font-bold text-slate-700">โต๊ะ Standard</span>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">ราคาต่อชั่วโมง</p>
              </div>
              <div className="flex items-center gap-2">
                <Input 
                  className="w-24 text-right font-bold" 
                  value={standardPrice} 
                  onChange={e => setStandardPrice(e.target.value)}
                />
                <span className="text-sm font-bold text-slate-400">บาท</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-amber-50/50 rounded-xl border border-amber-100">
              <div className="space-y-0.5">
                <span className="text-sm font-bold text-slate-700 font-vip">โต๊ะ VIP ROOM</span>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">ราคาต่อชั่วโมง</p>
              </div>
              <div className="flex items-center gap-2">
                <Input 
                  className="w-24 text-right font-bold" 
                  value={vipPrice} 
                  onChange={e => setVipPrice(e.target.value)}
                />
                <span className="text-sm font-bold text-slate-400">บาท</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Booking Policy */}
        <Card className="space-y-6">
          <div className="flex items-center gap-3 pb-2 border-b border-slate-50">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <ShieldCheck size={20} />
            </div>
            <h3 className="font-bold text-slate-900">นโยบายการจอง</h3>
          </div>

          <div className="space-y-4">
             <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">
                ระยะเวลาที่ยอมให้สาย (นาที)
              </label>
              <div className="flex items-center gap-3">
                <Input 
                  type="number"
                  value={lateThreshold} 
                  onChange={e => setLateThreshold(e.target.value)}
                  className="w-24 font-bold"
                />
                <span className="text-sm text-slate-500">นาที</span>
              </div>
              <p className="text-[10px] text-slate-400 px-1 pt-1">
                หากลูกค้ามาช้าเกินเวลาที่กำหนด ระบบจะทำการเปลี่ยนสถานะเป็น ไม่มาตามนัด และปล่อยโต๊ะว่างอัตโนมัติ
              </p>
            </div>
          </div>
        </Card>

        {/* Payment Settings */}
        <Card className="space-y-6 md:col-span-2">
          <div className="flex items-center gap-3 pb-2 border-b border-slate-50">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <span className="text-xl">💳</span>
            </div>
            <h3 className="font-bold text-slate-900">การชำระเงิน</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">
                QR Code สำหรับรับเงิน (PromptPay)
              </label>
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="space-y-3 flex-1 w-full">
                  <Input 
                    type="file" 
                    accept="image/*"
                    onChange={e => {
                      const file = e.target.files?.[0]
                      if (file) setQrFile(file)
                    }}
                    className="h-auto py-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <p className="text-xs text-slate-500">
                    อัปโหลดรูป QR Code ที่ลูกค้าจะใช้สแกนจ่ายเงิน
                  </p>
                </div>
                
                {/* Preview */}
                {(qrFile || paymentQrUrl) && (
                  <div className="relative group w-32 h-32 bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
                    <img 
                      src={qrFile ? URL.createObjectURL(qrFile) : paymentQrUrl} 
                      alt="Payment QR" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}


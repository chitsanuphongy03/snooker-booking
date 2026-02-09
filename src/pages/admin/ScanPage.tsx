import { useEffect, useState, useRef } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2, AlertCircle, ImagePlus } from 'lucide-react'

export function ScanPage() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [initializing, setInitializing] = useState(true)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    
    // Initialize scanner
    const startScanner = async () => {
        try {
            // Create instance
            if (!scannerRef.current) {
                scannerRef.current = new Html5Qrcode("reader")
            }
            
            setInitializing(true)
            
            // Allow some time for the DOM to be ready
            await new Promise(r => setTimeout(r, 100))
            
            if (!mountedRef.current) return

            try {
                // Try environment facing camera first
                await startCamera({ facingMode: "environment" })
            } catch (envError) {
                console.warn("Environmental camera failed, trying user camera", envError)
                
                // Force a small delay and ensure cleanup before retry
                await new Promise(r => setTimeout(r, 1000))
                
                try {
                    // Check if scanner is in a weird state and try to stop it just in case
                    if (scannerRef.current?.isScanning) {
                        await scannerRef.current.stop().catch(() => {})
                    }
                    await startCamera({ facingMode: "user" })
                } catch (userError) {
                    console.error("All camera attempts failed", userError)
                    
                    const envErr = envError as { message?: string }
                    const userErr = userError as { message?: string }

                    // If the specific "Cannot transition" error occurs, it means we were too fast.
                    // Throw a specific error object we can catch below
                    if (userErr?.message?.includes("Cannot transition") || envErr?.message?.includes("Cannot transition")) {
                         throw new Error("Cannot transition")
                    }
                    
                    throw userError 
                }
            }
        } catch (err: unknown) {
            console.error("Error starting scanner", err)
            if (mountedRef.current) {
                let errorMessage = "ไม่สามารถเปิดกล้องได้"
                const errorObj = err as { name?: string; message?: string }
                
                // Detailed error handling
                if (errorObj?.message === "Cannot transition" || errorObj?.toString().includes("Cannot transition")) {
                     errorMessage = "กำลังเริ่มการทำงานของกล้อง..."
                     // Automatic retry logic
                     setTimeout(() => {
                        window.location.reload()
                     }, 1500)
                } else if (errorObj?.name === "NotAllowedError" || errorObj?.name === "PermissionDeniedError") {
                    errorMessage = "กรุณาอนุญาตให้เว็บไซต์เข้าถึงกล้อง"
                } else if (errorObj?.name === "NotFoundError" || errorObj?.name === "DevicesNotFoundError") {
                    errorMessage = "ไม่พบกล้องในอุปกรณ์นี้"
                } else if (errorObj?.name === "NotReadableError" || errorObj?.name === "TrackStartError") {
                    errorMessage = "กล้องถูกใช้งานโดยโปรแกรมอื่น"
                } else if (typeof err === 'string') {
                     errorMessage = err
                }
                
                setError(errorMessage)
                setInitializing(false)
            }
        }
    }

    const startCamera = async (config: { facingMode: string } | string) => {
        if (!scannerRef.current) return
        
        // Safety check: if scanning, stop first
        if (scannerRef.current.isScanning) {
            try {
                await scannerRef.current.stop()
            } catch (e) {
                console.warn("Failed to stop scanner before restart", e)
            }
        }
        
        // Double check state before starting
        await scannerRef.current.start(
            config,
            {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                aspectRatio: window.innerWidth / window.innerHeight
            },
            (decodedText) => {
                if (decodedText.includes('/booking/')) {
                        // Stop immediately upon success to prevent multiple reads
                        scannerRef.current?.stop().then(() => {
                            try {
                            const url = new URL(decodedText)
                            if (url.pathname.startsWith('/booking/')) {
                                const bookingId = url.pathname.split('/').pop()
                                navigate(`/admin/booking/${bookingId}`)
                            }
                            } catch (e) { console.error(e) }
                        }).catch(console.error)
                }
            },
            () => {} 
        )
        setInitializing(false)
    }

    startScanner()

    return () => {
        mountedRef.current = false
        if (scannerRef.current && scannerRef.current.isScanning) {
            scannerRef.current.stop().catch(console.error)
        }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // ... (rest of useEffect)
  }, [])

  const handleBack = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
        try {
            await scannerRef.current.stop()
        } catch (e) {
            console.error(e)
        }
    }
    navigate('/admin')
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !scannerRef.current) return;

    try {
        // If camera is running, stop it first
        if (scannerRef.current.isScanning) {
            await scannerRef.current.stop();
        }

        const decodedText = await scannerRef.current.scanFile(file, true);
        if (decodedText.includes('/booking/')) {
            try {
                        const url = new URL(decodedText);
                        if (url.pathname.startsWith('/booking/')) {
                            const bookingId = url.pathname.split('/').pop()
                            navigate(`/admin/booking/${bookingId}`)
                        } else {
                    alert('QR Code ไม่ถูกต้อง: ไม่ใช่ลิงก์การจอง');
                    // Restart camera
                    window.location.reload(); 
                }
            } catch (e) {
                 console.error(e)
                 alert('QR Code ไม่ถูกต้อง');
                 window.location.reload();
            }
        } else {
            alert('ไม่พบ QR Code การจองในรูปภาพ');
            window.location.reload();
        }
    } catch (err) {
        console.error("Error scanning file", err);
        alert('ไม่สามารถอ่าน QR Code จากรูปภาพนี้ได้');
        window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black text-white flex flex-col justify-start">
      {/* Header / Back Button */}
      <div className="absolute top-0 left-0 right-0 p-4 z-20 flex justify-between items-start bg-linear-to-b from-black/50 to-transparent">
        <button 
            onClick={handleBack}
            className="flex items-center gap-2 px-4 py-2 bg-black/30 backdrop-blur-md rounded-full text-white font-medium hover:bg-black/50 transition-all border border-white/20"
        >
            <ArrowLeft size={20} />
            กลับ
        </button>
      </div>

      <input 
            type="file" 
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileUpload}
        />

      {/* Camera Viewport */}
      <div id="reader" className="w-full h-full object-cover relative z-10 bg-black"></div>

      {/* Loading State */}
      {initializing && !error && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-900">
            <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
            <p className="text-slate-400">กำลังเปิดกล้อง...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-900 p-6 text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-bold mb-2">เกิดข้อผิดพลาด</h3>
            <p className="text-slate-400 mb-6">{error}</p>
            <button 
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-slate-800 rounded-full font-medium hover:bg-slate-700 transition-colors"
            >
                ลองใหม่ (รีโหลดหน้า)
            </button>
        </div>
      )}

      {/* Overlay Guidelines (Custom) */}
      {!initializing && !error && (
        <>
            <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
                <div className="w-64 h-64 border-2 border-emerald-500/80 rounded-2xl relative shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-emerald-500 -mt-0.5 -ml-0.5 rounded-tl-sm"></div>
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-emerald-500 -mt-0.5 -mr-0.5 rounded-tr-sm"></div>
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-emerald-500 -mb-0.5 -ml-0.5 rounded-bl-sm"></div>
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-emerald-500 -mb-0.5 -mr-0.5 rounded-br-sm"></div>
                    
                    <p className="absolute -bottom-8 left-0 right-0 text-center text-sm font-medium text-white/80 shadow-sm">
                        วาง QR Code ในกรอบ หรือเลือกรูป
                    </p>
                </div>
            </div>

             {/* Floating Action Button for Image Upload */}
             <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-28 right-6 z-50 w-14 h-14 bg-black/30 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 active:scale-95 transition-all border-4 border-black/20"
            >
                <ImagePlus size={24} />
            </button>
        </>
      )}
    </div>
  )
}

import { Link } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'
import { Button } from '../components/ui/Button'

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* 404 Illustration */}
        <div className="relative">
          <div className="text-[180px] font-black text-slate-100 leading-none select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 bg-emerald-100 rounded-full flex items-center justify-center">
              <svg
                className="w-16 h-16 text-emerald-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-slate-900">
            ไม่พบหน้าที่คุณค้นหา
          </h1>
          <p className="text-slate-500 text-lg">
            หน้านี้อาจถูกย้ายหรือลบไปแล้ว หรือ URL อาจไม่ถูกต้อง
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/">
            <Button variant="primary" className="w-full sm:w-auto flex items-center gap-2">
              <Home size={18} />
              กลับหน้าแรก
            </Button>
          </Link>
          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={18} />
            ย้อนกลับ
          </Button>
        </div>

        {/* Help Text */}
        <p className="text-sm text-slate-400">
          หากคุณคิดว่านี่คือข้อผิดพลาด กรุณาติดต่อเจ้าหน้าที่
        </p>
      </div>
    </div>
  )
}

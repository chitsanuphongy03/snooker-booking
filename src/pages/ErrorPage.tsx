import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom'
import { Home, RefreshCw } from 'lucide-react'
import { Button } from '../components/ui/Button'

export function ErrorPage() {
  const error = useRouteError()
  
  let errorMessage = 'เกิดข้อผิดพลาดที่ไม่คาดคิด'
  let errorCode = '500'
  
  if (isRouteErrorResponse(error)) {
    errorCode = String(error.status)
    errorMessage = error.statusText || error.data?.message || errorMessage
  } else if (error instanceof Error) {
    errorMessage = error.message
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Error Icon */}
        <div className="w-24 h-24 mx-auto bg-red-100 rounded-full flex items-center justify-center">
          <svg
            className="w-12 h-12 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        {/* Message */}
        <div className="space-y-3">
          <div className="text-6xl font-black text-slate-200">{errorCode}</div>
          <h1 className="text-2xl font-bold text-slate-900">
            เกิดข้อผิดพลาด
          </h1>
          <p className="text-slate-500">
            {errorMessage}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            variant="primary" 
            onClick={() => window.location.reload()}
            className="flex items-center gap-2"
          >
            <RefreshCw size={18} />
            ลองใหม่
          </Button>
          <Link to="/">
            <Button variant="outline" className="w-full flex items-center gap-2">
              <Home size={18} />
              กลับหน้าแรก
            </Button>
          </Link>
        </div>

        {/* Tech Details (for debugging) */}
        {import.meta.env.DEV && error instanceof Error && (
          <div className="text-left bg-slate-100 rounded-lg p-4 overflow-auto max-h-40">
            <p className="text-xs font-mono text-slate-500">{error.stack}</p>
          </div>
        )}
      </div>
    </div>
  )
}

import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Table as TableIcon, ClipboardList, Settings, LogOut, BarChart3, QrCode } from 'lucide-react'
import { cn } from '../../utils/cn'
import { useEffect, useState } from 'react'

import { supabase } from '../../lib/supabaseClient'

export function AdminLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoading(false)
      if (!session) {
        navigate('/admin/login', { replace: true })
      }
    })

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate('/admin/login', { replace: true })
      }
    })

    return () => subscription.unsubscribe()
  }, [navigate])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/admin/login')
  }

  const menuItems = [
    { icon: LayoutDashboard, label: 'ภาพรวม', path: '/admin' },
    { icon: TableIcon, label: 'โต๊ะ', path: '/admin/tables' },
    { icon: QrCode, label: 'สแกน', path: '/admin/scan' },
    { icon: ClipboardList, label: 'การจอง', path: '/admin/bookings' },
    { icon: BarChart3, label: 'รายงาน', path: '/admin/reports' },
    { icon: Settings, label: 'ตั้งค่า', path: '/admin/settings' },
  ]

  if (isLoading) return <div className="h-screen flex items-center justify-center text-emerald-600">กำลังตรวจสอบสิทธิ์...</div>

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar - Desktop */}
      <aside className="w-64 bg-slate-900 text-white hidden md:flex flex-col">
        <div className="p-6">
          <Link to="/admin" className="text-xl font-bold text-emerald-500">
            Admin<span className="text-white font-medium">Panel</span>
          </Link>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                location.pathname === item.path 
                  ? 'bg-emerald-600 text-white' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              )}
            >
              <item.icon size={20} />
              {item.label}
            </Link>
          ))}
          <div className="my-2 border-t border-slate-800 mx-3" />
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            ออกจากระบบ
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6">
          <h1 className="text-lg font-bold text-slate-900">
            {menuItems.find(m => m.path === location.pathname)?.label || 'Admin'}
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500 hidden sm:inline">ยินดีต้อนรับ, เจ้าของร้าน</span>
            <button 
              onClick={handleLogout}
              className="md:hidden p-2 text-slate-400 hover:text-red-500 transition-colors"
              title="ออกจากระบบ"
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto pb-28 md:pb-6">
          <Outlet />
        </main>

        {/* Floating Bottom Nav - Revolut Style */}
        <div className="md:hidden fixed bottom-5 left-4 right-4 z-50">
          <nav className="bg-white rounded-[28px] shadow-[0_4px_24px_rgba(0,0,0,0.08)] py-2 px-3">
            <div className="flex items-center justify-around">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="flex flex-col items-center justify-center py-1 px-3 relative"
                  >
                    {/* Active pill background */}
                    {isActive && (
                      <div className="absolute inset-0 bg-slate-100 rounded-2xl" />
                    )}
                    <div className="relative z-10 flex flex-col items-center gap-1">
                      <item.icon 
                        size={22} 
                        strokeWidth={isActive ? 2.2 : 1.8}
                        className={isActive ? 'text-slate-900' : 'text-slate-500'}
                      />
                      <span className={cn(
                        "text-[10px] font-medium",
                        isActive ? "text-slate-900" : "text-slate-500"
                      )}>
                        {item.label}
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </nav>
        </div>
      </div>
    </div>
  )
}

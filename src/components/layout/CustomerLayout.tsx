import { Outlet, Link, useLocation } from 'react-router-dom'
import { Home, Search } from 'lucide-react'
import { cn } from '../../utils/cn'

export function CustomerLayout() {
  const location = useLocation()
  
  const navItems = [
    { icon: Home, label: 'หน้าแรก', path: '/' },
    { icon: Search, label: 'สถานะ', path: '/check' },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-emerald-600">
             Snooker<span className="text-slate-900">Booking</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/check" className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">เช็คสถานะ</Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 pb-28 md:pb-8">
        <Outlet />
      </main>

      {/* Floating Bottom Navigation - Revolut Style */}
      <div className="md:hidden fixed bottom-5 left-4 right-4 z-50">
        <nav className="bg-white rounded-[28px] shadow-[0_4px_24px_rgba(0,0,0,0.08)] py-2 px-3">
          <div className="flex items-center justify-around">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex flex-col items-center justify-center py-1 px-5 relative"
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
  )
}

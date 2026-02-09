import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Lock, User, LogIn, ChevronLeft, Eye, EyeOff } from 'lucide-react'
import { motion } from 'framer-motion'
import { supabase } from '../../lib/supabaseClient'

export function LoginPage() {
  const [username, setUsername] = useState('') // This will be email
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Supabase Auth requires email
      const { error } = await supabase.auth.signInWithPassword({
        email: username,
        password: password,
      })

      if (error) throw error

      navigate('/admin', { replace: true })
    } catch (err) {
      console.error('Login error:', err)
      setError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8"
      >
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-4 rotate-3 shadow-lg shadow-emerald-100">
            <Lock size={32} />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin<span className="text-emerald-600">Login</span></h1>
          <p className="text-slate-500">ยินดีต้อนรับเข้าสู่ระบบจัดการโต๊ะสนุกเกอร์</p>
        </div>

        <Card className="p-8 shadow-xl border-slate-100/50">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-500 p-3 rounded-lg text-xs font-bold border border-red-100 animate-shake">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <User size={16} /> ชื่อผู้ใช้
              </label>
              <Input 
                required
                placeholder="admin@example.com" 
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Lock size={16} /> รหัสผ่าน
              </label>
              <div className="relative">
                <Input 
                  required
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full text-lg" 
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn size={20} /> เข้าสู่ระบบ
                </span>
              )}
            </Button>
          </form>
        </Card>

        <button 
          onClick={() => navigate('/')}
          className="w-full flex items-center justify-center gap-2 text-slate-400 hover:text-emerald-600 transition-colors text-sm font-medium py-2"
        >
          <ChevronLeft size={16} /> กลับสู่หน้าจองของลูกค้า
        </button>
      </motion.div>
    </div>
  )
}

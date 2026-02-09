import { motion } from 'framer-motion'
import { cn } from '../../utils/cn'

interface SnookerTableProps {
  name: string
  status: 'available' | 'occupied' | 'maintenance'
  type: 'standard' | 'vip'
  occupiedUntil?: string
  availableSlots?: string[]
  onClick?: (time?: string) => void
  disabled?: boolean
  showSlots?: boolean
  children?: React.ReactNode
}

export function SnookerTable({ 
  name, 
  status, 
  type, 
  occupiedUntil, 
  availableSlots, 
  onClick, 
  disabled,
  showSlots = true,
  children
}: SnookerTableProps) {
  const isAvailable = status === 'available'
  
  const statusColors = {
    available: 'bg-green-500',
    occupied: 'bg-red-500',
    maintenance: 'bg-slate-400'
  }

  const tableColors = {
    available: 'bg-emerald-600',
    occupied: 'bg-rose-600',
    maintenance: 'bg-slate-500'
  }

  return (
    <motion.div
      whileHover={!disabled ? { y: -5, scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      onClick={() => !disabled && onClick?.()}
      className={cn(
        'relative cursor-pointer group rounded-2xl p-4 transition-all border-2 flex flex-col items-center gap-4',
        'border-slate-100 bg-white shadow-sm hover:border-emerald-200',
        !isAvailable && 'opacity-90 cursor-default grayscale-[0.2]',
        isAvailable && 'hover:border-emerald-500 shadow-emerald-50',
        disabled && 'pointer-events-none'
      )}
    >
      {/* status Badge */}
      {status !== 'maintenance' && (
        <div className={cn(
          'absolute top-4 right-4 px-2 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-wider z-10',
          statusColors[status]
        )}>
          {status === 'available' ? 'ว่าง' : (occupiedUntil ? `ไม่ว่าง (-${occupiedUntil})` : 'ไม่ว่าง')}
        </div>
      )}

      {/* Table Graphic (SVG) */}
      <div className="relative w-full aspect-2/1 bg-amber-900 rounded-lg p-1.5 shadow-xl ring-1 ring-amber-900/50">
        {/* The Green/Red Cloth */}
        <div className={cn(
          'w-full h-full rounded-sm relative overflow-hidden transition-colors duration-500 shadow-inner',
          tableColors[status]
        )}>
          {/* Table Markings (Baulk line and D) */}
          <div className="absolute left-[20%] top-0 bottom-0 w-px bg-white/20"></div>
          <div className="absolute left-[20%] top-1/2 -translate-y-1/2 -translate-x-1/2 w-[30%] aspect-square rounded-full border border-white/10 clip-path-D"></div>
          
          {/* Pockets */}
          <div className="absolute top-0 left-0 w-3 h-3 bg-slate-900 rounded-br-full border-r border-b border-amber-950/20"></div>
          <div className="absolute top-0 right-0 w-3 h-3 bg-slate-900 rounded-bl-full border-l border-b border-amber-950/20"></div>
          <div className="absolute bottom-0 left-0 w-3 h-3 bg-slate-900 rounded-tr-full border-r border-t border-amber-950/20"></div>
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-slate-900 rounded-tl-full border-l border-t border-amber-950/20"></div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-1.5 bg-slate-900 rounded-b-full"></div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-1.5 bg-slate-900 rounded-t-full"></div>
          
          {/* Snooker Balls Decoration */}
          {status === 'occupied' && (
            <>
              <motion.div 
                animate={{ x: [0, 5, -5, 0], y: [0, 2, -2, 0] }}
                transition={{ repeat: Infinity, duration: 4 }}
                className="absolute top-[30%] left-[60%] w-2 h-2 bg-white rounded-full shadow-sm"
              />
              <div className="absolute top-[50%] left-[80%] flex gap-0.5 flex-wrap w-4">
                <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="text-center space-y-1">
        <h3 className={cn(
          'font-bold text-lg',
          isAvailable ? 'text-slate-900' : 'text-slate-500'
        )}>
          {name}
        </h3>
        <p className="text-xs font-bold text-emerald-600 uppercase tracking-tighter">
          {type === 'vip' ? 'VIP ROOM' : 'Standard Table'}
        </p>
      </div>

      {/* Availability Slots */}
      {showSlots && status !== 'maintenance' && availableSlots && availableSlots.length > 0 && (
        <div className="w-full space-y-2 pt-2 border-t border-slate-50">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
            รอบว่างที่จองได้
          </p>
          <div className="flex flex-wrap justify-center gap-1.5">
            {availableSlots.map((time) => (
              <button
                key={time}
                onClick={(e) => {
                  e.stopPropagation()
                  onClick?.(time)
                }}
                className="px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-bold hover:bg-emerald-500 hover:text-white transition-colors border border-emerald-100"
              >
                {time}
              </button>
            ))}
          </div>
        </div>
      )}

      {children && (
        <div className="w-full pt-2">
          {children}
        </div>
      )}

      {type === 'vip' && (
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-950 text-[10px] font-black px-4 py-0.5 rounded-full border-2 border-white shadow-sm">
          PREMIUM
        </div>
      )}
    </motion.div>
  )
}


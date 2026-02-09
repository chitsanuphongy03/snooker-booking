import { motion } from 'framer-motion'

interface LoadingProps {
  fullScreen?: boolean
  text?: string
}

export function Loading({ fullScreen = true, text = 'กำลังโหลดข้อมูล...' }: LoadingProps) {
  return (
    <div className={`
      flex flex-col items-center justify-center 
      ${fullScreen ? 'fixed inset-0 z-50 bg-white/80 backdrop-blur-sm' : 'w-full py-12'}
    `}>
      <div className="relative w-16 h-16 mb-4">
        <motion.div
          className="absolute inset-0 border-4 border-emerald-100 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
           className="absolute inset-0 border-4 border-emerald-600 rounded-full border-t-transparent shadow-emerald-200"
           animate={{ rotate: 360 }}
           transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
      <motion.p 
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-emerald-700 font-bold text-sm tracking-wide animate-pulse"
      >
        {text}
      </motion.p>
    </div>
  )
}

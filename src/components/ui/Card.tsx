import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../utils/cn'

interface CardProps {
  children: ReactNode
  className?: string
  noPadding?: boolean
}

export function Card({ children, className, noPadding = false }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden',
        !noPadding && 'p-6',
        className
      )}
    >
      {children}
    </motion.div>
  )
}

Card.Header = ({ children, className }: CardProps) => (
  <div className={cn('mb-4', className)}>{children}</div>
)

Card.Title = ({ children, className }: { children: ReactNode; className?: string }) => (
  <h3 className={cn('text-lg font-semibold text-slate-900', className)}>{children}</h3>
)

Card.Description = ({ children, className }: { children: ReactNode; className?: string }) => (
  <p className={cn('text-sm text-slate-500', className)}>{children}</p>
)

Card.Content = ({ children, className }: CardProps) => (
  <div className={cn('', className)}>{children}</div>
)

Card.Footer = ({ children, className }: CardProps) => (
  <div className={cn('mt-6 pt-4 border-t border-slate-100', className)}>{children}</div>
)

import { useState, type ReactNode } from 'react'
import { Modal } from '../components/ui/Modal'
import { Button } from '../components/ui/Button'
import { CheckCircle2, AlertCircle, Info } from 'lucide-react'
import { AlertContext, type AlertType } from './AlertContext'

export function AlertProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [config, setConfig] = useState<{
    title: string
    message: string
    type: AlertType
    onConfirm?: () => void
  }>({
    title: '',
    message: '',
    type: 'info'
  })

  const showAlert = (options: {
    title: string
    message: string
    type?: AlertType
    onConfirm?: () => void
  }) => {
    setConfig({
      title: options.title,
      message: options.message,
      type: options.type || 'info',
      onConfirm: options.onConfirm
    })
    setIsOpen(true)
  }

  const handleClose = () => {
    setIsOpen(false)
    if (config.onConfirm) {
      config.onConfirm()
    }
  }

  const getIcon = () => {
    switch (config.type) {
      case 'success':
        return <CheckCircle2 className="w-12 h-12 text-emerald-500" />
      case 'error':
        return <AlertCircle className="w-12 h-12 text-red-500" />
      default:
        return <Info className="w-12 h-12 text-blue-500" />
    }
  }

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      <Modal 
        isOpen={isOpen} 
        onClose={handleClose} 
        title={config.title}
        className="max-w-sm"
      >
        <div className="flex flex-col items-center text-center space-y-4 py-2">
          <div className="p-3 bg-slate-50 rounded-full">
            {getIcon()}
          </div>
          <p className="text-slate-600 leading-relaxed font-medium">
            {config.message}
          </p>
          <Button 
            onClick={handleClose} 
            className="w-full mt-2"
          >
            ตกลง
          </Button>
        </div>
      </Modal>
    </AlertContext.Provider>
  )
}

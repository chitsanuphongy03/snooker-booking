import { createContext } from 'react'

export type AlertType = 'success' | 'error' | 'info'

export interface AlertContextType {
  showAlert: (options: {
    title: string
    message: string
    type?: AlertType
    onConfirm?: () => void
  }) => void
}

export const AlertContext = createContext<AlertContextType | undefined>(undefined)

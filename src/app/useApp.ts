import { useContext } from 'react'
import { AppContext } from './contextBase'
import type { AppContextValue } from './contextBase'

export function useApp(): AppContextValue {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp must be used within AppProvider')
  return context
}
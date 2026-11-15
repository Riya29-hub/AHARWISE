import { createContext } from 'react'
import type { Food, NutrientTargets, Profile, Screening } from '../types'

export type SubstituteRule = { from: string; to: string; reason: string; tags: string[]; note: string; allergenWarning?: string; goal?: string }
export type AppData = {
  foods: Food[]
  targets: Record<string, NutrientTargets>
  substitutions: SubstituteRule[]
  prices: { location: string; stores: string[]; multipliers: Record<string, number> }
}

export type AppContextValue = {
  data: AppData | null
  loadError: string
  profile: Profile
  screening: Screening
  setProfile: (profile: Profile) => void
  setScreening: (screening: Screening) => void
  clearSavedData: () => void
  toast: string
  notify: (message: string) => void
}

export const AppContext = createContext<AppContextValue | null>(null)
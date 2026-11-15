import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { loadJSON } from '../lib/data'
import { clearProfile, getProfile, getScreening, saveProfile, saveScreening } from '../lib/storage'
import { initialProfile, initialScreening } from './defaults'
import { AppContext, type AppContextValue, type AppData, type SubstituteRule } from './contextBase'
import type { Food, NutrientTargets, Profile, Screening } from '../types'

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData | null>(null)
  const [loadError, setLoadError] = useState('')
  const [profile, setProfileState] = useState<Profile>(() => getProfile() ?? initialProfile)
  const [screening, setScreeningState] = useState<Screening>(() => getScreening() ?? initialScreening)
  const [toast, setToast] = useState('')

  useEffect(() => {
    let active = true
    Promise.all([
      loadJSON<{ foods: Food[] }>('foods.json'),
      loadJSON<{ targets: Record<string, Omit<NutrientTargets, 'label'>>; label: string }>('nutrient-reference.json'),
      loadJSON<SubstituteRule[]>('substitutions.json'),
      loadJSON<AppData['prices']>('grocery-prices.json'),
    ]).then(([foodData, reference, substitutions, prices]) => {
      if (active) setData({
        foods: foodData.foods,
        targets: Object.fromEntries(Object.entries(reference.targets).map(([key, target]) => [key, { ...target, label: reference.label }])),
        substitutions, prices,
      })
    }).catch((error: unknown) => {
      if (active) setLoadError(error instanceof Error ? error.message : 'Food data could not be loaded.')
    })
    return () => { active = false }
  }, [])

  useEffect(() => {
    const resetAfterStartOver = () => {
      if (window.location.hash === '#/' && !getProfile() && !getScreening()) {
        setProfileState(initialProfile)
        setScreeningState(initialScreening)
      }
    }
    window.addEventListener('hashchange', resetAfterStartOver)
    return () => window.removeEventListener('hashchange', resetAfterStartOver)
  }, [])

  useEffect(() => {
    if (toast) {
      const timer = window.setTimeout(() => setToast(''), 3200)
      return () => window.clearTimeout(timer)
    }
  }, [toast])

  const value = useMemo<AppContextValue>(() => ({
    data, loadError, profile, screening,
    setProfile: (next) => { setProfileState(next); saveProfile(next) },
    setScreening: (next) => { setScreeningState(next); saveScreening(next) },
    clearSavedData: () => { clearProfile(); setProfileState(initialProfile); setScreeningState(initialScreening) },
    toast, notify: setToast,
  }), [data, loadError, profile, screening, toast])
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}


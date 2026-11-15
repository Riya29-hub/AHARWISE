import type { Profile, Screening } from '../types'

const profileKey = 'aharwiseProfile'
const screeningKey = 'aharwiseScreening'

function isProfile(value: unknown): value is Profile {
  if (!value || typeof value !== 'object') return false
  const profile = value as Partial<Profile>
  const ageGroups = ['toddler', 'child', 'teen', 'adult', 'senior']
  const diets = ['vegan', 'vegetarian', 'eggetarian', 'non-vegetarian']
  const allergens = ['peanut', 'tree-nut', 'milk', 'egg', 'soy', 'gluten', 'fish', 'shellfish', 'sesame']
  return typeof profile.familyName === 'string' && Array.isArray(profile.members)
    && profile.members.every((member) => Boolean(member) && typeof member.id === 'string'
      && ageGroups.includes(member.ageGroup) && Number.isFinite(member.age) && member.age > 0)
    && typeof profile.diet === 'string' && diets.includes(profile.diet)
    && Array.isArray(profile.allergies) && profile.allergies.every((item) => allergens.includes(item))
    && Array.isArray(profile.otherAllergies) && profile.otherAllergies.every((item) => typeof item === 'string')
    && Array.isArray(profile.avoidedFoods) && profile.avoidedFoods.every((item) => typeof item === 'string')
    && typeof profile.weeklyBudget === 'number' && Number.isFinite(profile.weeklyBudget) && profile.weeklyBudget >= 0
    && typeof profile.city === 'string' && typeof profile.store === 'string'
}

function isScreening(value: unknown): value is Screening {
  if (!value || typeof value !== 'object') return false
  const screening = value as Partial<Screening>
  return Array.isArray(screening.selectedFoods) && screening.selectedFoods.every((item) => Boolean(item)
    && typeof item.foodId === 'string' && Number.isFinite(item.portionMultiplier) && item.portionMultiplier > 0
    && Number.isFinite(item.servingsPerWeek) && item.servingsPerWeek >= 0)
    && typeof screening.mealsPerDay === 'number' && Number.isFinite(screening.mealsPerDay)
    && typeof screening.fruitVegetableServings === 'number' && Number.isFinite(screening.fruitVegetableServings)
    && typeof screening.processedFrequency === 'string' && typeof screening.updatedAt === 'string'
}

export function saveProfile(profile: Profile): boolean {
  try { localStorage.setItem(profileKey, JSON.stringify(profile)); return true } catch { return false }
}

export function getProfile(): Profile | null {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(profileKey) ?? 'null')
    return isProfile(value) ? value : null
  } catch { return null }
}

export function clearProfile(): void {
  try { localStorage.removeItem(profileKey); localStorage.removeItem(screeningKey) } catch { /* Storage may be disabled. */ }
}

export function saveScreening(screening: Screening): boolean {
  try { localStorage.setItem(screeningKey, JSON.stringify(screening)); return true } catch { return false }
}

export function getScreening(): Screening | null {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(screeningKey) ?? 'null')
    return isScreening(value) ? value : null
  } catch { return null }
}
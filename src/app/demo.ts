import type { AgeGroup, FamilyMember, Profile, Screening } from '../types'

function demoMember(ageGroup: AgeGroup, index: number): FamilyMember {
  const age = ageGroup === 'toddler' ? 2 : ageGroup === 'child' ? 8 : 30
  return { id: `demo-member-${index}`, ageGroup, age }
}

export function applyDemo(
  setProfile: (profile: Profile) => void,
  setScreening: (screening: Screening) => void,
  navigate: (path: string) => void,
) {
  setProfile({
    familyName: 'The Rao family',
    members: [demoMember('adult', 0), demoMember('adult', 1), demoMember('child', 2), demoMember('toddler', 3)],
    diet: 'vegetarian', allergies: ['peanut', 'milk'], otherAllergies: [], avoidedFoods: ['brinjal'],
    weeklyBudget: 3000, city: 'Bengaluru', store: 'Local grocery store',
  })
  const screening: Screening = {
    selectedFoods: [
      { foodId: 'rice', portionMultiplier: 1, servingsPerWeek: 7 },
      { foodId: 'toor-dal', portionMultiplier: 1, servingsPerWeek: 5 },
      { foodId: 'spinach', portionMultiplier: 1, servingsPerWeek: 4 },
      { foodId: 'banana', portionMultiplier: 1, servingsPerWeek: 5 },
      { foodId: 'carrot', portionMultiplier: 0.5, servingsPerWeek: 4 },
    ],
    mealsPerDay: 3, fruitVegetableServings: 3, processedFrequency: 'Sometimes', updatedAt: new Date().toISOString(),
  }
  setScreening(screening)
  navigate('/results')
}
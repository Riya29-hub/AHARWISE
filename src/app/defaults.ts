import type { Profile, Screening } from '../types'

export const initialProfile: Profile = {
  familyName: '', members: [], diet: 'vegetarian', allergies: [], otherAllergies: [],
  avoidedFoods: [], weeklyBudget: 3000, city: 'Bengaluru', store: 'Local grocery store',
}

export const initialScreening: Screening = {
  selectedFoods: [], mealsPerDay: 3, fruitVegetableServings: 3, processedFrequency: 'Sometimes', updatedAt: '',
}
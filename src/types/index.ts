export type Diet = 'vegan' | 'vegetarian' | 'eggetarian' | 'non-vegetarian'
export type AgeGroup = 'toddler' | 'child' | 'teen' | 'adult' | 'senior'
export type Allergen = 'peanut' | 'tree-nut' | 'milk' | 'egg' | 'soy' | 'gluten' | 'fish' | 'shellfish' | 'sesame'
export type FoodCategory = 'Grains' | 'Pulses & Protein' | 'Dairy & Alternatives' | 'Vegetables' | 'Fruits' | 'Snacks' | 'Beverages' | 'Processed'

export interface Food {
  id: string
  name: string
  category: FoodCategory
  unit: 'g' | 'ml'
  pricePer100: number
  nutrients: { protein: number; fiber: number; iron: number; calcium: number; sodium: number }
  allergens: Allergen[]
  diet: Diet
  imageEmoji: string
}

export interface FamilyMember {
  id: string
  ageGroup: AgeGroup
  age: number
}

export interface Profile {
  familyName: string
  members: FamilyMember[]
  diet: Diet
  allergies: Allergen[]
  otherAllergies: string[]
  avoidedFoods: string[]
  weeklyBudget: number
  city: string
  store: string
}

export interface SelectedFood {
  foodId: string
  portionMultiplier: number
  servingsPerWeek: number
}

export interface Screening {
  selectedFoods: SelectedFood[]
  mealsPerDay: number
  fruitVegetableServings: number
  processedFrequency: string
  updatedAt: string
}

export interface NutrientTargets {
  label: string
  protein: number
  fiber: number
  calcium: number
  iron: number
  sodiumLimit: number
}

export interface GroceryItem {
  food: Food
  gramsPerWeek: number
  cost: number
}
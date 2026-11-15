import type { Allergen, Diet, Food, GroceryItem, NutrientTargets, Profile } from '../types'

const dietRank: Record<Diet, number> = { vegan: 0, vegetarian: 1, eggetarian: 2, 'non-vegetarian': 3 }

export function filterByAllergy<T extends Pick<Food, 'allergens'>>(foods: T[], allergies: string[]): T[] {
  const blocked = new Set(allergies.map((allergen) => allergen.toLowerCase()))
  return foods.filter((food) => !food.allergens.some((allergen) => blocked.has(allergen.toLowerCase())))
}

export function filterByDiet<T extends Pick<Food, 'diet' | 'name'>>(foods: T[], diet: Diet, avoids: string[] = []): T[] {
  const blockedNames = avoids.map((item) => item.trim().toLowerCase()).filter(Boolean)
  return foods.filter((food) => dietRank[food.diet] <= dietRank[diet]
    && !blockedNames.some((avoid) => food.name.toLowerCase().includes(avoid)))
}

export function filterByProfileSafety<T extends Pick<Food, 'allergens' | 'diet' | 'name'>>(
  foods: T[], profile: Pick<Profile, 'diet' | 'allergies' | 'otherAllergies' | 'avoidedFoods'>,
): T[] {
  if (profile.otherAllergies.some((allergen) => allergen.trim())) return []
  return filterByAllergy(filterByDiet(foods, profile.diet, profile.avoidedFoods), profile.allergies)
}

export function estimateWeeklyCost(food: Food, gramsPerWeek: number, storeMultiplier = 1): number {
  const safeGrams = Number.isFinite(gramsPerWeek) ? Math.max(0, gramsPerWeek) : 0
  const safeMultiplier = Number.isFinite(storeMultiplier) ? Math.max(0, storeMultiplier) : 1
  return Math.max(0, (food.pricePer100 * safeGrams * safeMultiplier) / 100)
}

export function rankByNutritionPerRupee(foods: Food[]): Array<{ food: Food; score: number; explanation: string }> {
  const weights = { protein: 0.4, fiber: 0.25, iron: 0.2, calcium: 0.15 }
  const max = { protein: 25, fiber: 15, iron: 10, calcium: 500 }
  return foods.map((food) => {
    const weighted = Object.entries(weights).reduce((sum, [key, weight]) => {
      const nutrient = key as keyof typeof weights
      return sum + Math.min(food.nutrients[nutrient] / max[nutrient], 1) * weight
    }, 0)
    const cost = Math.max(food.pricePer100, 1)
    return {
      food,
      score: weighted / cost * 100,
      explanation: 'Weighted screening value per rupee: protein 40%, fiber 25%, iron 20%, calcium 15%.',
    }
  }).sort((a, b) => b.score - a.score)
}

function familySize(profile: Profile): number {
  return Math.max(profile.members.length, 1)
}

export function buildGroceryList(profile: Profile, foods: Food[], storeMultiplier = 1): {
  items: GroceryItem[]; total: number; remaining: number
} {
  const safeFoods = filterByProfileSafety(foods, profile)
  const ranked = rankByNutritionPerRupee(safeFoods)
  const countByCategory = new Map<string, number>()
  for (const { food } of ranked) countByCategory.set(food.category, (countByCategory.get(food.category) ?? 0) + 1)
  const items: GroceryItem[] = []
  let total = 0
  const categoryCaps: Record<string, number> = {
    Grains: 3000, 'Pulses & Protein': 1800, 'Dairy & Alternatives': 2200,
    Vegetables: 2600, Fruits: 1400, Snacks: 500, Beverages: 900, Processed: 400,
  }
  const budget = Number.isFinite(profile.weeklyBudget) ? Math.max(0, profile.weeklyBudget) : 0
  for (const { food } of ranked) {
    const gramsPerWeek = Math.round((categoryCaps[food.category] ?? 500) * familySize(profile) / 4 / (countByCategory.get(food.category) ?? 1))
    const cost = estimateWeeklyCost(food, gramsPerWeek, storeMultiplier)
    if (total + cost <= budget) {
      items.push({ food, gramsPerWeek, cost })
      total += cost
    }
  }
  return { items, total, remaining: Math.max(budget - total, 0) }
}

export function calculateIntake(
  selectedFoods: Food[], portions: Record<string, number>, servingsPerWeek: Record<string, number>, members: number,
): Record<'protein' | 'fiber' | 'calcium' | 'iron' | 'sodium', number> {
  const totals = { protein: 0, fiber: 0, calcium: 0, iron: 0, sodium: 0 }
  for (const food of selectedFoods) {
    const gramsPerDay = (portions[food.id] ?? 100) * (servingsPerWeek[food.id] ?? 0) / 7 / Math.max(members, 1)
    for (const nutrient of Object.keys(totals) as Array<keyof typeof totals>) {
      totals[nutrient] += food.nutrients[nutrient] * gramsPerDay / 100
    }
  }
  return Object.fromEntries(Object.entries(totals).map(([key, value]) => [key, Number(value.toFixed(1))])) as typeof totals
}

export type GapStatus = 'on track' | 'slightly low' | 'low' | 'above limit'
export function calculateGap(
  intake: Record<string, number>, target: NutrientTargets,
): Record<string, { intake: number; target: number; gap: number; percent: number; status: GapStatus }> {
  const result: Record<string, { intake: number; target: number; gap: number; percent: number; status: GapStatus }> = {}
  for (const nutrient of ['protein', 'fiber', 'calcium', 'iron'] as const) {
    const current = intake[nutrient] ?? 0
    const goal = target[nutrient]
    const percent = goal > 0 ? current / goal * 100 : 100
    result[nutrient] = {
      intake: current, target: goal, gap: Math.max(0, goal - current), percent,
      status: percent >= 90 ? 'on track' : percent >= 60 ? 'slightly low' : 'low',
    }
  }
  const sodium = intake.sodium ?? 0
  result.sodium = {
    intake: sodium, target: target.sodiumLimit, gap: Math.max(0, target.sodiumLimit - sodium),
    percent: target.sodiumLimit > 0 ? sodium / target.sodiumLimit * 100 : 0,
    status: sodium > target.sodiumLimit ? 'above limit' : 'on track',
  }
  return result
}

export function findSubstitutions(
  foodId: string, reason: string, profile: Profile, foods: Food[],
  rules: Array<{ from: string; to: string; reason: string; note: string; allergenWarning?: string }> = [],
): Array<{ original: Food; replacement: Food; note: string; allergenWarning: string; costDelta: number }> {
  const safeFoods = filterByProfileSafety(foods, profile)
  const original = safeFoods.find((food) => food.id === foodId)
  if (!original) return []
  return rules.filter((rule) => rule.from === foodId && (reason === 'any' || rule.reason === reason))
    .map((rule) => ({ rule, replacement: safeFoods.find((food) => food.id === rule.to) }))
    .filter((entry) => Boolean(entry.replacement && entry.replacement.id !== foodId))
    .map(({ rule, replacement }) => ({
      original, replacement: replacement as Food, note: rule.note, allergenWarning: rule.allergenWarning ?? '',
      costDelta: (replacement as Food).pricePer100 - original.pricePer100,
    }))
}

export function foodGroupCoverage(foods: Food[]): Array<{ category: string; count: number }> {
  const categories = ['Grains', 'Pulses & Protein', 'Dairy & Alternatives', 'Vegetables', 'Fruits']
  return categories.map((category) => ({ category, count: foods.filter((food) => food.category === category).length }))
}

export function matchesAllergen(food: Food, allergens: Allergen[]): boolean {
  return food.allergens.some((allergen) => allergens.includes(allergen))
}

export function averageTargets(profile: Pick<Profile, 'members'>, targets: Record<string, NutrientTargets>): NutrientTargets {
  const members = profile.members.length ? profile.members : [{ ageGroup: 'adult' as const }]
  const values = members.map((member) => targets[member.ageGroup] ?? targets.adult)
  const average = (key: keyof NutrientTargets) => Math.round(values.reduce((sum, item) => sum + Number(item[key] ?? 0), 0) / values.length)
  return {
    label: 'Simplified screening targets',
    protein: average('protein'),
    fiber: average('fiber'),
    calcium: average('calcium'),
    iron: average('iron'),
    sodiumLimit: average('sodiumLimit'),
  }
}
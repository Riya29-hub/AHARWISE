import { beforeEach, describe, expect, it } from 'vitest'
import foodFile from '../../../public/data/foods.json'
import substitutionRules from '../../../public/data/substitutions.json'
import { buildGroceryList, calculateGap, calculateIntake, estimateWeeklyCost, filterByAllergy, filterByDiet, filterByProfileSafety, findSubstitutions } from '../nutrition'
import { clearProfile, getProfile, getScreening, saveProfile, saveScreening } from '../storage'
import type { Allergen, Food, Profile } from '../../types'

const foods = foodFile.foods as Food[]
const profileBase: Profile = {
  familyName: 'Test family', members: [{ id: 'one', ageGroup: 'adult', age: 30 }], diet: 'non-vegetarian',
  allergies: [], otherAllergies: [], avoidedFoods: [], weeklyBudget: 3000, city: 'Bengaluru', store: 'Local grocery store',
}
const targets = { label: 'Simplified screening targets', protein: 50, fiber: 25, calcium: 1000, iron: 18, sodiumLimit: 2000 }

describe('nutrition screening calculations', () => {
  it('filters every food containing a selected allergen', () => {
    const safe = filterByAllergy(foods, ['milk', 'peanut'])
    expect(safe.every((food) => !food.allergens.some((allergen) => ['milk', 'peanut'].includes(allergen)))).toBe(true)
    expect(safe.some((food) => food.id === 'paneer' || food.id === 'peanuts')).toBe(false)
  })

  it('fails closed when a free-text allergy cannot be mapped', () => {
    const profile = { ...profileBase, otherAllergies: ['an unclassified food allergy'] }
    expect(filterByProfileSafety(foods, profile)).toEqual([])
    expect(buildGroceryList(profile, foods).items).toEqual([])
  })

  it('enforces the hierarchical diet allowances', () => {
    expect(filterByDiet(foods, 'vegan').every((food) => food.diet === 'vegan')).toBe(true)
    expect(filterByDiet(foods, 'vegetarian').some((food) => food.diet === 'eggetarian' || food.diet === 'non-vegetarian')).toBe(false)
    expect(filterByDiet(foods, 'eggetarian').some((food) => food.diet === 'non-vegetarian')).toBe(false)
    expect(filterByDiet(foods, 'non-vegetarian')).toHaveLength(foods.length)
    expect(filterByDiet(foods, 'vegan', ['ragi']).some((food) => food.id === 'ragi')).toBe(false)
  })

  it('estimates weekly cost with store multiplier', () => {
    const rice = foods.find((food) => food.id === 'rice')!
    expect(estimateWeeklyCost(rice, 300, 1.12)).toBeCloseTo(20.16)
    expect(estimateWeeklyCost(rice, -100)).toBe(0)
  })

  it('keeps grocery lists within budget and excludes allergens', () => {
    const profile = { ...profileBase, allergies: ['peanut', 'milk'] as Allergen[], weeklyBudget: 500 }
    const result = buildGroceryList(profile, foods, 1.12)
    expect(result.total).toBeLessThanOrEqual(profile.weeklyBudget)
    expect(result.remaining).toBeGreaterThanOrEqual(0)
    expect(result.items.every((item) => !item.food.allergens.some((allergen) => profile.allergies.includes(allergen)))).toBe(true)
  })

  it('calculates average daily per-person intake from weekly servings', () => {
    const rice = foods.find((food) => food.id === 'rice')!
    const result = calculateIntake([rice], { rice: 100 }, { rice: 7 }, 1)
    expect(result.protein).toBe(2.7)
    expect(result.fiber).toBe(0.4)
    expect(calculateIntake([rice], { rice: 100 }, { rice: 7 }, 2).protein).toBe(1.4)
  })

  it('uses the requested gap status thresholds and sodium limit', () => {
    const gap = calculateGap({ protein: 45, fiber: 22.5, calcium: 600, iron: 10, sodium: 2100 }, targets)
    expect(gap.protein.status).toBe('on track')
    expect(gap.fiber.status).toBe('on track')
    expect(gap.calcium.status).toBe('slightly low')
    expect(gap.iron.status).toBe('low')
    expect(gap.sodium.status).toBe('above limit')
    expect(gap.sodium.gap).toBe(0)
  })

  it('drops unsafe replacements and unsafe originals from substitutions', () => {
    const result = findSubstitutions('milk', 'any', { ...profileBase, allergies: ['soy'] }, foods, substitutionRules)
    expect(result.every((item) => !item.replacement.allergens.includes('soy'))).toBe(true)
    expect(findSubstitutions('milk', 'any', { ...profileBase, allergies: ['milk'] }, foods, substitutionRules)).toEqual([])
  })
})

describe('local-only profile storage', () => {
  beforeEach(() => { localStorage.clear() })

  it('saves, retrieves, and clears profile and screening data', () => {
    expect(saveProfile(profileBase)).toBe(true)
    expect(getProfile()).toEqual(profileBase)
    const screening = { selectedFoods: [{ foodId: 'rice', portionMultiplier: 1, servingsPerWeek: 3 }], mealsPerDay: 3, fruitVegetableServings: 4, processedFrequency: 'Sometimes', updatedAt: '2026-01-01' }
    expect(saveScreening(screening)).toBe(true)
    expect(getScreening()).toEqual(screening)
    clearProfile()
    expect(getProfile()).toBeNull()
    expect(getScreening()).toBeNull()
  })

  it('handles corrupted localStorage values without throwing', () => {
    localStorage.setItem('aharwiseProfile', '{broken json')
    localStorage.setItem('aharwiseScreening', JSON.stringify({ selectedFoods: 'wrong', updatedAt: 3 }))
    expect(getProfile()).toBeNull()
    expect(getScreening()).toBeNull()
    expect(() => clearProfile()).not.toThrow()
  })

  it('rejects structurally valid JSON with invalid schema values', () => {
    localStorage.setItem('aharwiseProfile', JSON.stringify({ ...profileBase, diet: 'flexitarian' }))
    localStorage.setItem('aharwiseScreening', JSON.stringify({ selectedFoods: [], mealsPerDay: 'often', updatedAt: 'today' }))
    expect(getProfile()).toBeNull()
    expect(getScreening()).toBeNull()
  })
})

describe('allergen safety audit', () => {
  const audits: Array<{ name: string; allergens: Allergen[] }> = [
    { name: 'peanut', allergens: ['peanut'] }, { name: 'milk', allergens: ['milk'] },
    { name: 'egg', allergens: ['egg'] }, { name: 'soy', allergens: ['soy'] },
    { name: 'gluten', allergens: ['gluten'] }, { name: 'fish', allergens: ['fish'] },
    { name: 'shellfish', allergens: ['shellfish'] }, { name: 'sesame', allergens: ['sesame'] },
    { name: 'tree-nut', allergens: ['tree-nut'] },
    { name: 'multi-allergy', allergens: ['peanut', 'milk', 'egg', 'soy', 'gluten', 'fish', 'shellfish', 'sesame', 'tree-nut'] },
  ]

  it.each(audits)('$name profile has no unsafe recommendation leaks', ({ allergens }) => {
    const profile = { ...profileBase, allergies: allergens }
    const suitable = filterByAllergy(filterByDiet(foods, profile.diet, profile.avoidedFoods), profile.allergies)
    const grocery = buildGroceryList(profile, foods).items.map((item) => item.food)
    const gapSuggestions = suitable.filter((food) => food.nutrients.protein > 0 || food.nutrients.fiber > 0)
    const substitutions = substitutionRules.flatMap((rule) => findSubstitutions(rule.from, rule.reason, profile, foods, [rule]))
    const budgetSwaps = substitutionRules.filter((rule) => rule.reason === 'cost')
      .flatMap((rule) => findSubstitutions(rule.from, 'cost', profile, foods, [rule]))
    for (const surface of [suitable, grocery, gapSuggestions, substitutions.flatMap((item) => [item.original, item.replacement]), budgetSwaps.flatMap((item) => [item.original, item.replacement])]) {
      expect(surface.every((food) => !food.allergens.some((allergen) => allergens.includes(allergen)))).toBe(true)
    }
  })

  it('never exposes dairy, egg, or meat to a vegan household', () => {
    const vegan = { ...profileBase, diet: 'vegan' as const }
    const suitable = filterByDiet(foods, vegan.diet)
    const grocery = buildGroceryList(vegan, foods).items.map((item) => item.food)
    const swaps = substitutionRules.flatMap((rule) => findSubstitutions(rule.from, rule.reason, vegan, foods, [rule]))
    for (const food of [...suitable, ...grocery, ...swaps.flatMap((item) => [item.original, item.replacement])]) {
      expect(food.diet).toBe('vegan')
    }
  })
})
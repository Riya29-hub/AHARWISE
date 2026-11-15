import { useState } from 'react'
import { ArrowRight, Search, ShieldAlert, Utensils } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../app/useApp'
import { averageTargets, filterByProfileSafety, filterByDiet, calculateIntake } from '../lib/nutrition'
import type { Food, SelectedFood } from '../types'

const categories = ['All foods', 'Grains', 'Pulses & Protein', 'Dairy & Alternatives', 'Vegetables', 'Fruits', 'Snacks', 'Beverages', 'Processed']
const portionMultipliers = [{ label: 'Small', value: 0.5 }, { label: 'Medium', value: 1 }, { label: 'Large', value: 1.5 }]

function amount(food: Food, multiplier: number) {
  return Math.round((food.unit === 'ml' ? 150 : 100) * multiplier)
}

export default function ScreeningPage() {
  const { data, profile, screening, setScreening, notify } = useApp()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All foods')
  if (!data) return <div className="page-wrap"><div className="loading-surface">Loading food library…</div></div>

  const foodById = new Map(data.foods.map((food) => [food.id, food]))
  const safeByDiet = filterByDiet(data.foods, profile.diet, profile.avoidedFoods)
  const allergySafe = new Set(filterByProfileSafety(data.foods, profile).map((food) => food.id))
  const foods = safeByDiet.filter((food) => (category === 'All foods' || food.category === category)
    && food.name.toLowerCase().includes(query.toLowerCase()))
  const selectedIds = new Set(screening.selectedFoods.map((item) => item.foodId))
  const selectedFoods = screening.selectedFoods.flatMap((item) => {
    const food = foodById.get(item.foodId)
    return food && allergySafe.has(food.id) ? [food] : []
  })
  const portions = Object.fromEntries(screening.selectedFoods.flatMap((item) => {
    const food = foodById.get(item.foodId)
    return food ? [[item.foodId, amount(food, item.portionMultiplier)]] : []
  }))
  const frequencies = Object.fromEntries(screening.selectedFoods.map((item) => [item.foodId, item.servingsPerWeek]))
  const intake = calculateIntake(selectedFoods, portions, frequencies, Math.max(profile.members.length, 1))
  const safeCount = allergySafe.size

  const toggleFood = (food: Food) => {
    if (!allergySafe.has(food.id)) return
    const next = selectedIds.has(food.id)
      ? screening.selectedFoods.filter((item) => item.foodId !== food.id)
      : [...screening.selectedFoods, { foodId: food.id, portionMultiplier: 1, servingsPerWeek: 3 }]
    setScreening({ ...screening, selectedFoods: next })
  }
  const updateSelected = (foodId: string, patch: Partial<SelectedFood>) => setScreening({
    ...screening, selectedFoods: screening.selectedFoods.map((item) => item.foodId === foodId ? { ...item, ...patch } : item),
  })
  const dailyTargets = averageTargets(profile, data.targets)
  const percent = (key: 'protein' | 'fiber' | 'calcium' | 'iron') => dailyTargets[key] > 0 ? Math.min(intake[key] / dailyTargets[key] * 100, 100) : 0
  const generate = () => {
    if (!profile.members.length) { notify('Add a family member before generating estimates.'); navigate('/profile'); return }
    if (!screening.selectedFoods.some((item) => allergySafe.has(item.foodId))) { notify('Select at least one safe food to continue.'); return }
    setScreening({ ...screening, updatedAt: new Date().toISOString() })
    navigate('/results')
  }

  return <div className="page-wrap"><div className="page-heading"><div><span className="eyebrow">Step 2 · Nutrition screening</span><h1>What does your family eat?</h1><p>Choose familiar foods and how often they are eaten in a typical week. These are screening estimates, not a diagnosis.</p></div><div className="selection-count"><b>{selectedFoods.length}</b><span>foods selected</span></div></div><div className="screening-layout"><section className="screening-main"><div className="search-row"><label className="search-box"><Search size={18} /><span className="sr-only">Search foods</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search foods" /></label><span className="quiet">{safeCount} foods fit this profile</span></div><div className="category-tabs" role="tablist" aria-label="Food categories">{categories.map((item) => <button key={item} role="tab" aria-selected={category === item} className={category === item ? 'category-tab active' : 'category-tab'} onClick={() => setCategory(item)}>{item}</button>)}</div><div className="food-grid">{foods.map((food) => {
      const selected = screening.selectedFoods.find((item) => item.foodId === food.id)
      const isAllergen = !allergySafe.has(food.id)
      const matching = food.allergens.filter((allergen) => profile.allergies.includes(allergen))
      return <article className={`food-card ${isAllergen ? 'food-card-blocked' : ''} ${selected ? 'food-card-selected' : ''}`} key={food.id}>
        <button className="food-select" disabled={isAllergen} onClick={() => toggleFood(food)} aria-pressed={Boolean(selected)} aria-label={`${selected ? 'Remove' : 'Add'} ${food.name}${isAllergen ? ', blocked by allergy' : ''}`}><span className="food-card-emoji" aria-hidden="true">{food.imageEmoji}</span><span className="food-card-name">{food.name}</span><span className="food-category-label">{food.category}</span><span className="food-price">₹{food.pricePer100} <small>/ 100 {food.unit}</small></span></button>
        {isAllergen && <span className="allergen-warning"><ShieldAlert size={14} />{matching.length ? `Contains ${matching.join(', ')} – avoid` : 'Blocked while other allergy is listed'}</span>}
        {selected && !isAllergen && <div className="food-controls"><div className="portion-options" aria-label={`${food.name} portion size`}>{portionMultipliers.map((portion) => <button className={selected.portionMultiplier === portion.value ? 'portion-option active' : 'portion-option'} key={portion.label} onClick={() => updateSelected(food.id, { portionMultiplier: portion.value })}>{portion.label}</button>)}</div><label>Servings / week<input aria-label={`${food.name} servings per week`} type="number" min="1" max="21" value={selected.servingsPerWeek} onChange={(event) => { const next = Number(event.target.value); if (Number.isFinite(next)) updateSelected(food.id, { servingsPerWeek: Math.max(1, Math.min(21, next)) }) }} /></label></div>}
      </article>
    })}</div>{foods.length === 0 && <div className="empty-state"><Utensils size={23} /><h3>No matching foods</h3><p>Try a different search or category.</p></div>}
    <section className="panel questions-panel"><div className="panel-title"><span className="panel-icon warm"><Utensils size={18} /></span><div><h2>A little more context</h2><p>Optional household habits for a more useful screening conversation.</p></div></div><div className="question-grid"><label className="field-label">Meals per day<select className="text-input" value={screening.mealsPerDay} onChange={(event) => setScreening({ ...screening, mealsPerDay: Number(event.target.value) })}>{[2, 3, 4, 5].map((value) => <option value={value} key={value}>{value} meals</option>)}</select></label><label className="field-label">Packaged / processed foods<select className="text-input" value={screening.processedFrequency} onChange={(event) => setScreening({ ...screening, processedFrequency: event.target.value })}>{['Rarely', 'Sometimes', 'Often', 'Most days'].map((value) => <option key={value}>{value}</option>)}</select></label><label className="field-label slider-field">Fruit & vegetable servings per day <b>{screening.fruitVegetableServings}</b><input type="range" min="0" max="10" value={screening.fruitVegetableServings} onChange={(event) => setScreening({ ...screening, fruitVegetableServings: Number(event.target.value) })} /></label></div></section><div className="screening-actions"><span className="quiet">Your entries save automatically in this browser.</span><button className="button button-primary" onClick={generate}>Generate results <ArrowRight size={17} /></button></div></section>
    <aside className="plate-summary panel"><div className="sticky-panel-head"><span className="eyebrow">Live estimate</span><h2>Today’s plate</h2><p>Approximate daily amount per person from weekly selections.</p></div><div className="plate-items">{selectedFoods.slice(0, 5).map((food) => { const item = screening.selectedFoods.find((entry) => entry.foodId === food.id)!; return <div className="plate-item" key={food.id}><span aria-hidden="true">{food.imageEmoji}</span><b>{food.name}</b><small>{amount(food, item.portionMultiplier)} {food.unit} · {item.servingsPerWeek}× / week</small></div> })}{selectedFoods.length === 0 && <p className="empty-inline">Selected foods will appear here.</p>}</div><div className="plate-rule" />{(['protein', 'fiber', 'calcium', 'iron'] as const).map((key) => <div className="intake-meter" key={key}><div><span>{key[0].toUpperCase() + key.slice(1)}</span><b>{intake[key]} <small>{key === 'calcium' || key === 'iron' ? 'mg' : 'g'}</small></b></div><span className="meter-track"><i style={{ width: `${percent(key)}%` }} /></span><small>{Math.round(percent(key))}% of simplified screening target</small></div>)}<p className="estimate-note">Results are estimates based on the information you provide.</p></aside></div></div>
}
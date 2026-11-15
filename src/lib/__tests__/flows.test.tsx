import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import foodFile from '../../../public/data/foods.json'
import referenceFile from '../../../public/data/nutrient-reference.json'
import substitutionFile from '../../../public/data/substitutions.json'
import pricesFile from '../../../public/data/grocery-prices.json'
import App from '../../App'

function mockDataFetch() {
  vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input)
    const payload = url.endsWith('foods.json')
      ? foodFile
      : url.endsWith('nutrient-reference.json')
        ? referenceFile
        : url.endsWith('substitutions.json')
          ? substitutionFile
          : url.endsWith('grocery-prices.json')
            ? pricesFile
            : null
    if (!payload) return new Response('Not found', { status: 404 })
    return new Response(JSON.stringify(payload), { status: 200, headers: { 'Content-Type': 'application/json' } })
  }))
}

vi.mock('react-chartjs-2', () => ({
  Bar: ({ 'aria-label': label }: { 'aria-label'?: string }) => <div data-testid="bar-chart">{label}</div>,
  Doughnut: ({ 'aria-label': label }: { 'aria-label'?: string }) => <div data-testid="doughnut-chart">{label}</div>,
}))

describe('AHARWISE end-to-end user flows', () => {
  beforeEach(() => {
    localStorage.clear()
    window.location.hash = '#/'
    mockDataFetch()
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('completes the demo family flow from Home to Results and Start over', async () => {
    render(<App />)
    const demoBtn = await screen.findByRole('button', { name: /Try demo family/i })
    fireEvent.click(demoBtn)

    await waitFor(() => {
      expect(screen.getByText('The Rao family')).toBeInTheDocument()
      expect(screen.getByText(/nutrients on track/i)).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /Start over/i }))
    await waitFor(() => {
      expect(screen.getByText(/Smart nutrition for every family, every budget\./i)).toBeInTheDocument()
    })
    expect(localStorage.getItem('aharwiseProfile')).toBeNull()
  })

  it('validates Profile inputs, fails closed on custom allergies, and handles Screening stale foodIds', async () => {
    localStorage.setItem('aharwiseScreening', JSON.stringify({
      selectedFoods: [{ foodId: 'missing-food-id', portionMultiplier: 1, servingsPerWeek: 3 }],
      mealsPerDay: 3,
      fruitVegetableServings: 3,
      processedFrequency: 'Sometimes',
      updatedAt: '',
    }))

    window.location.hash = '#/profile'
    render(<App />)

    const continueBtn = await screen.findByRole('button', { name: /Continue to screening/i })
    expect(continueBtn).toBeDisabled()

    fireEvent.change(screen.getByPlaceholderText(/The Rao family/i), { target: { value: 'Sharma Family' } })
    fireEvent.click(screen.getByRole('button', { name: /Adult \+/i }))
    expect(continueBtn).toBeEnabled()

    const otherInput = screen.getByPlaceholderText(/Type and add/i)
    fireEvent.change(otherInput, { target: { value: 'Mustard' } })
    fireEvent.click(screen.getByRole('button', { name: 'Add' }))
    expect(screen.getByText(/Fail-closed safety active/i)).toBeInTheDocument()

    // Remove the custom allergy so Screening shows available foods
    fireEvent.click(screen.getByRole('button', { name: /Remove Mustard/i }))
    fireEvent.click(continueBtn)

    await waitFor(() => {
      expect(screen.getByText(/What does your family eat\?/i)).toBeInTheDocument()
    })

    // Select a food and generate results
    fireEvent.click(screen.getByRole('button', { name: /Add White rice/i }))
    fireEvent.click(screen.getByRole('button', { name: /Generate results/i }))

    await waitFor(() => {
      expect(screen.getByText('Sharma Family')).toBeInTheDocument()
    })
  })

  it('navigates Budget, Substitutions, Gaps, and About pages cleanly', async () => {
    render(<App />)
    fireEvent.click(await screen.findByRole('button', { name: /Try demo family/i }))
    await waitFor(() => expect(screen.getByText('The Rao family')).toBeInTheDocument())

    fireEvent.click(screen.getByRole('link', { name: 'Budget' }))
    await waitFor(() => expect(screen.getByText(/Make the budget go further\./i)).toBeInTheDocument())
    fireEvent.click(screen.getByLabelText(/Budget-friendly only/i))

    fireEvent.click(screen.getByRole('link', { name: 'Swaps' }))
    await waitFor(() => expect(screen.getByText(/Find a swap that fits\./i)).toBeInTheDocument())

    fireEvent.click(screen.getByRole('link', { name: 'Gaps' }))
    await waitFor(() => expect(screen.getByText(/A useful snapshot, not a verdict\./i)).toBeInTheDocument())
    fireEvent.click(screen.getByRole('tab', { name: 'Per member' }))
    expect(screen.getByText(/Toddler 4/i)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('link', { name: 'About' }))
    await waitFor(() => expect(screen.getByText(/Clarity, with the right limits\./i)).toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: /Clear my saved data/i }))
    fireEvent.click(screen.getByRole('button', { name: 'Clear data' }))
    expect(localStorage.getItem('aharwiseProfile')).toBeNull()
  })
})

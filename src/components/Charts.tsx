import { Bar, Doughnut } from 'react-chartjs-2'
import { ArcElement, BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Tooltip, type ChartOptions } from 'chart.js'
import type { GroceryItem } from '../types'

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend)

const palette = ['#1b7a43', '#5bb318', '#2f6db5', '#f2a93b', '#c0392b', '#86aa8a', '#f47a28', '#8a6e4b']
const barOptions: ChartOptions<'bar'> = {
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 18 } } },
  scales: { y: { beginAtZero: true, grid: { color: '#efe9da' } }, x: { grid: { display: false } } },
}
const donutOptions = { responsive: true, maintainAspectRatio: false, cutout: '66%', plugins: { legend: { position: 'bottom' as const, labels: { usePointStyle: true, padding: 16 } } } }

function DataTable({ title, headers, rows }: { title: string; headers: string[]; rows: Array<Array<string | number>> }) {
  return <table className="sr-only"><caption>{title} data</caption><thead><tr>{headers.map((header) => <th key={header} scope="col">{header}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={index}>{row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}</tr>)}</tbody></table>
}

export function NutrientChart({ values, targets, title = 'Nutrient intake and screening targets' }: { values: Record<string, number>; targets: Record<string, number>; title?: string }) {
  const keys = ['protein', 'fiber', 'calcium', 'iron']
  const labels = ['Protein (g)', 'Fiber (g)', 'Calcium (mg)', 'Iron (mg)']
  const percentages = keys.map((key) => targets[key] ? (values[key] ?? 0) / targets[key] * 100 : 0)
  const data = { labels, datasets: [
    { label: 'Estimated intake (% of target)', data: percentages, backgroundColor: '#1b7a43', borderRadius: 5 },
    { label: 'Screening target (simplified, 100%)', data: keys.map(() => 100), backgroundColor: '#f2a93b', borderRadius: 5 },
  ] }
  const options: ChartOptions<'bar'> = { ...barOptions, scales: { x: { grid: { display: false } }, y: { beginAtZero: true, suggestedMax: 100, grid: { color: '#efe9da' }, ticks: { callback: (value) => `${value}%` } } } }
  return <div className="chart-wrap"><Bar data={data} options={options} aria-label={`${title}, shown as percent of target`} /><DataTable title={title} headers={['Nutrient', 'Estimated intake', 'Screening target (simplified)', 'Percent of target']} rows={keys.map((key, index) => [labels[index], values[key] ?? 0, targets[key] ?? 0, `${percentages[index].toFixed(1)}%`])} /></div>
}

export function SpendChart({ items, title = 'Estimated spend by food group' }: { items: GroceryItem[]; title?: string }) {
  if (items.length === 0) return <div className="chart-placeholder">No grocery items fit the current filters and budget.</div>
  const totals = new Map<string, number>()
  for (const item of items) totals.set(item.food.category, (totals.get(item.food.category) ?? 0) + item.cost)
  const labels = Array.from(totals.keys())
  const values = Array.from(totals.values()).map((value) => Number(value.toFixed(0)))
  const data = { labels, datasets: [{ data: values, backgroundColor: labels.map((_, index) => palette[index % palette.length]), borderWidth: 3, borderColor: '#fff' }] }
  return <div className="chart-wrap donut-wrap"><Doughnut data={data} options={donutOptions} aria-label={title} /><DataTable title={title} headers={['Food group', 'Estimated cost in rupees']} rows={labels.map((label, index) => [label, values[index]])} /></div>
}

export function FoodGroupChart({ rows, title = 'Food-group coverage' }: { rows: Array<{ category: string; count: number }>; title?: string }) {
  const data = { labels: rows.map((row) => row.category), datasets: [{ label: 'Foods selected', data: rows.map((row) => row.count), backgroundColor: '#5bb318', borderRadius: 5 }] }
  return <div className="chart-wrap"><Bar data={data} options={{ ...barOptions, indexAxis: 'y' }} aria-label={title} /><DataTable title={title} headers={['Food group', 'Foods selected']} rows={rows.map((row) => [row.category, row.count])} /></div>
}

export function CostComparisonChart({ original, replacement }: { original: { name: string; price: number }; replacement: { name: string; price: number } }) {
  const data = { labels: [original.name, replacement.name], datasets: [{ label: 'Price per 100 g/ml (₹)', data: [original.price, replacement.price], backgroundColor: ['#f2a93b', '#1b7a43'], borderRadius: 5 }] }
  return <div className="chart-wrap"><Bar data={data} options={{ ...barOptions, plugins: { legend: { display: false } } }} aria-label="Cost comparison" /><DataTable title="Cost comparison" headers={['Food', 'Price per 100 g/ml in rupees']} rows={[[original.name, original.price], [replacement.name, replacement.price]]} /></div>
}
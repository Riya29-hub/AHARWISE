export async function loadJSON<T>(file: string): Promise<T> {
  const response = await fetch(`${import.meta.env.BASE_URL}data/${file}`)
  if (!response.ok) throw new Error(`Could not load ${file} (${response.status}).`)
  return response.json() as Promise<T>
}
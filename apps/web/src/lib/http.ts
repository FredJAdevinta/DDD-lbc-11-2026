// An answer of the API other than 2xx. `champ`, when the API gives one, is
// the JSON key of the request field at fault: a form shows the message under
// that field.
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public champ?: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// The browser goes through the Vite dev proxy (`/api`, see vite.config.ts).
// Server-side rendering runs in Node, where there is no proxy: it calls the
// Go API directly.
const API_BASE_URL =
  typeof window === 'undefined'
    ? (process.env.API_URL ?? 'http://localhost:8080')
    : '/api'

async function apiError(response: Response): Promise<ApiError> {
  try {
    const body = (await response.json()) as { erreur?: string; champ?: string }
    return new ApiError(
      body.erreur ?? response.statusText,
      response.status,
      body.champ,
    )
  } catch {
    return new ApiError(response.statusText, response.status)
  }
}

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })
  if (!response.ok) {
    throw await apiError(response)
  }
  if (response.status === 204) {
    return undefined as T
  }
  return (await response.json()) as T
}

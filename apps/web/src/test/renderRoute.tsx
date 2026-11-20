import { QueryClient } from '@tanstack/react-query'
import { RouterProvider, createMemoryHistory } from '@tanstack/react-router'
import { render, waitFor } from '@testing-library/react'
import { expect } from 'vitest'
import { createInMemoryGateways } from '#/gateways'
import { getRouter } from '#/router'
import type { Gateways } from '#/gateways'

// Renders a route against in-memory gateways. Pass the gateways a test wants
// to control; the others keep their default in-memory behavior.
export async function renderRoute(
  path: string,
  options: { gateways?: Partial<Gateways> } = {},
) {
  const router = getRouter({
    queryClient: new QueryClient({
      defaultOptions: { queries: { retry: false } },
    }),
    gateways: createInMemoryGateways(options.gateways),
  })
  router.update({
    history: createMemoryHistory({ initialEntries: [path] }),
    context: router.options.context,
  })

  // The root route renders <html> and <body>: mount on the document, as the
  // app hydrates it. Inside a div, React's body singleton fights the portals
  // (Spark toasts) and any re-render loops forever.
  const result = render(<RouterProvider router={router} />, {
    container: document,
  })
  await router.load()
  await waitFor(() => expect(router.state.status).toBe('idle'))

  return result
}

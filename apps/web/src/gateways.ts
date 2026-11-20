import { createHttpAnnonceGateway } from '#/features/annonce/http-annonce-gateway'
import { createInMemoryAnnonceGateway } from '#/features/annonce/in-memory-annonce-gateway'
import { createHttpHealthGateway } from '#/features/health/http-health-gateway'
import { createInMemoryHealthGateway } from '#/features/health/in-memory-health-gateway'
import type { AnnonceGateway } from '#/features/annonce/annonce-gateway'
import type { HealthGateway } from '#/features/health/health-gateway'

// Every port the UI depends on. Routes read it from the router context and
// never import an adapter.
export interface Gateways {
  annonce: AnnonceGateway
  health: HealthGateway
}

export function createHttpGateways(): Gateways {
  return {
    annonce: createHttpAnnonceGateway(),
    health: createHttpHealthGateway(),
  }
}

export function createInMemoryGateways(
  overrides: Partial<Gateways> = {},
): Gateways {
  return {
    annonce: createInMemoryAnnonceGateway(),
    health: createInMemoryHealthGateway(),
    ...overrides,
  }
}

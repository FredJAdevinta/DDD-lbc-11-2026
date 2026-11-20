import type { Annonce } from '#/features/annonce/annonce-gateway'

// An activee annonce for the tests; override what the test is about.
export function uneAnnonce(overrides: Partial<Annonce> = {}): Annonce {
  return {
    id: crypto.randomUUID(),
    titre: 'Vélo électrique de ville',
    description: 'Autonomie 60 km, révisé il y a un mois.',
    prix: 89000,
    categorie: { code: 'loisirs', libelle: 'Loisirs' },
    localisation: {
      ville: 'Saint-Étienne',
      codePostal: '42000',
      departement: { code: '42', nom: 'Loire' },
      region: { code: '84', nom: 'Auvergne-Rhône-Alpes' },
    },
    vendeur: { pseudo: 'stephanois' },
    images: [],
    deposeeLe: '2026-11-02T10:00:00Z',
    ...overrides,
  }
}

// `count` annonces titled « Annonce 00 »… deposited a day apart, the last
// one the most recent.
export function desAnnonces(count: number): Array<Annonce> {
  return Array.from({ length: count }, (_, i) =>
    uneAnnonce({
      titre: `Annonce ${String(i).padStart(2, '0')}`,
      deposeeLe: new Date(Date.UTC(2026, 9, 1 + i, 10)).toISOString(),
    }),
  )
}

// Where an annonce of `uneAnnonce` is, for the lieu filters.
export const lieux = {
  saintDenis93: {
    ville: 'Saint-Denis',
    codePostal: '93200',
    departement: { code: '93', nom: 'Seine-Saint-Denis' },
    region: { code: '11', nom: 'Île-de-France' },
  },
  saintDenis974: {
    ville: 'Saint-Denis',
    codePostal: '97400',
    departement: { code: '974', nom: 'La Réunion' },
    region: { code: '04', nom: 'La Réunion' },
  },
  ajaccio: {
    ville: 'Ajaccio',
    codePostal: '20000',
    departement: { code: '2A', nom: 'Corse-du-Sud' },
    region: { code: '94', nom: 'Corse' },
  },
  bastia: {
    ville: 'Bastia',
    codePostal: '20200',
    departement: { code: '2B', nom: 'Haute-Corse' },
    region: { code: '94', nom: 'Corse' },
  },
} satisfies Record<string, Annonce['localisation']>

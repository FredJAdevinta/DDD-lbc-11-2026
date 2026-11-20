import type { Categorie } from './annonce-gateway'

// The closed list of catégories, in display order. The codes are the API's
// and stay stable; only the libellés are prose.
export const categories: Array<Categorie> = [
  { code: 'vehicules', libelle: 'Véhicules' },
  { code: 'immobilier', libelle: 'Immobilier' },
  { code: 'multimedia', libelle: 'Multimédia' },
  { code: 'maison-jardin', libelle: 'Maison & Jardin' },
  { code: 'mode', libelle: 'Mode' },
  { code: 'loisirs', libelle: 'Loisirs' },
  { code: 'emploi-services', libelle: 'Emploi & Services' },
  { code: 'autres', libelle: 'Autres' },
]

export function libelleDeCategorie(code: string): string | undefined {
  return categories.find((categorie) => categorie.code === code)?.libelle
}

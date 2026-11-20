import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { createInMemoryAnnonceGateway } from '#/features/annonce/in-memory-annonce-gateway'
import { renderRoute } from '#/test/renderRoute'
import type { Annonce } from '#/features/annonce/annonce-gateway'

const velo: Annonce = {
  id: '0b6f4a8e-3c1d-4f2a-9e5b-7d8c9a0b1c2d',
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
}

const renderAnnonce = (id: string, annonces: Array<Annonce>) =>
  renderRoute(`/annonces/${id}`, {
    gateways: { annonce: createInMemoryAnnonceGateway({ annonces }) },
  })

// Intl separates thousands and the currency sign with narrow no-break spaces.
const prixText = (expected: string) => (text: string) =>
  text.replace(/\s/g, ' ') === expected

describe('Annonce page', () => {
  it('shows the detail of the annonce', async () => {
    await renderAnnonce(velo.id, [velo])

    expect(
      await screen.findByRole('heading', { name: 'Vélo électrique de ville' }),
    ).toBeInTheDocument()
    expect(screen.getByText(prixText('890 €'))).toBeInTheDocument()
    expect(screen.getByText('Loisirs')).toBeInTheDocument()
    expect(
      screen.getByText('Autonomie 60 km, révisé il y a un mois.'),
    ).toBeInTheDocument()
    expect(screen.getByText('Saint-Étienne 42000')).toBeInTheDocument()
    expect(
      screen.getByText('Loire (42), Auvergne-Rhône-Alpes'),
    ).toBeInTheDocument()
    expect(screen.getByText('stephanois')).toBeInTheDocument()
    expect(screen.getByText('Déposée le 2 novembre 2026')).toBeInTheDocument()
  })

  it('shows the local placeholder when the annonce has no image', async () => {
    await renderAnnonce(velo.id, [velo])

    expect(
      await screen.findByRole('img', { name: 'Pas de photo' }),
    ).toBeInTheDocument()
  })

  it('shows the first image when the annonce has some', async () => {
    const avecPhoto = { ...velo, images: ['https://example.com/velo.jpg'] }

    await renderAnnonce(velo.id, [avecPhoto])

    expect(
      await screen.findByRole('img', { name: 'Vélo électrique de ville' }),
    ).toHaveAttribute('src', 'https://example.com/velo.jpg')
  })

  it('says Don when the prix is zero', async () => {
    await renderAnnonce(velo.id, [{ ...velo, prix: 0 }])

    expect(await screen.findByText('Don')).toBeInTheDocument()
  })

  it('shows Annonce introuvable for an unknown annonce', async () => {
    await renderAnnonce('8e2d1c4b-0000-4000-8000-000000000000', [velo])

    expect(
      await screen.findByRole('heading', { name: 'Annonce introuvable' }),
    ).toBeInTheDocument()
  })
})

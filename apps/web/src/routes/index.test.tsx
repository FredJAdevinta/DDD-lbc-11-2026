import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { createInMemoryAnnonceGateway } from '#/features/annonce/in-memory-annonce-gateway'
import { desAnnonces, lieux, uneAnnonce } from '#/test/annonces'
import { renderRoute } from '#/test/renderRoute'
import type { Annonce } from '#/features/annonce/annonce-gateway'

const renderHomepage = (annonces: Array<Annonce>) =>
  renderRoute('/', {
    gateways: { annonce: createInMemoryAnnonceGateway({ annonces }) },
  })

describe('Homepage', () => {
  it('shows the twenty latest annonces, most recent first', async () => {
    await renderHomepage(desAnnonces(25))

    const liste = await screen.findByRole('list', {
      name: 'Dernières annonces',
    })
    const titres = within(liste)
      .getAllByRole('heading')
      .map((h) => h.textContent)
    expect(titres).toHaveLength(20)
    expect(titres[0]).toBe('Annonce 24')
    expect(titres[19]).toBe('Annonce 05')
  })

  it('opens an annonce from its card', async () => {
    await renderHomepage([uneAnnonce({ titre: 'Vélo électrique' })])

    await userEvent.click(
      await screen.findByRole('link', { name: /Vélo électrique/ }),
    )

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Vélo électrique' }),
    ).toBeInTheDocument()
  })

  it('searches by mot-cle from the search bar', async () => {
    await renderHomepage([
      uneAnnonce({ titre: 'Vélo Électrique' }),
      uneAnnonce({ titre: 'Canapé', description: 'Trois places, bon état.' }),
    ])

    await userEvent.type(
      await screen.findByRole('searchbox', { name: 'Mot-clé' }),
      'velo electrique',
    )
    await userEvent.click(screen.getByRole('button', { name: 'Rechercher' }))

    expect(
      await screen.findByRole('heading', { name: '1 annonce' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Vélo Électrique')).toBeInTheDocument()
    expect(screen.queryByText('Canapé')).not.toBeInTheDocument()
  })

  it('searches by mot-cle and categorie from the search bar', async () => {
    await renderHomepage([
      uneAnnonce({ titre: 'Vélo de ville' }),
      uneAnnonce({
        titre: 'Vélo cargo',
        categorie: { code: 'vehicules', libelle: 'Véhicules' },
      }),
    ])
    const user = userEvent.setup()

    await user.type(
      await screen.findByRole('searchbox', { name: 'Mot-clé' }),
      'velo',
    )
    await user.selectOptions(screen.getByLabelText('Catégorie'), 'vehicules')
    await user.click(screen.getByRole('button', { name: 'Rechercher' }))

    expect(
      await screen.findByRole('heading', { name: '1 annonce' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Vélo cargo')).toBeInTheDocument()
    expect(screen.getByLabelText('Catégorie')).toHaveValue('vehicules')
  })

  it('searches by lieu from the search bar', async () => {
    await renderHomepage([
      uneAnnonce({
        titre: 'Lampe dionysienne',
        localisation: lieux.saintDenis93,
      }),
      uneAnnonce({
        titre: 'Lampe réunionnaise',
        localisation: lieux.saintDenis974,
      }),
    ])
    const user = userEvent.setup()

    await user.selectOptions(
      await screen.findByLabelText('Région ou département'),
      'region:04',
    )
    await user.type(
      screen.getByRole('textbox', { name: 'Ville ou code postal' }),
      'saint-denis',
    )
    await user.click(screen.getByRole('button', { name: 'Rechercher' }))

    expect(
      await screen.findByRole('heading', { name: '1 annonce' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Lampe réunionnaise')).toBeInTheDocument()
    expect(screen.getByLabelText('Région ou département')).toHaveValue(
      'region:04',
    )
  })

  it('offers no prix filter on the search bar', async () => {
    await renderHomepage([uneAnnonce()])

    expect(
      await screen.findByRole('searchbox', { name: 'Mot-clé' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('textbox', { name: 'Prix min (€)' }),
    ).not.toBeInTheDocument()
  })

  it('says so when no annonce is online yet', async () => {
    await renderHomepage([])

    expect(
      await screen.findByText("Aucune annonce n'est en ligne pour le moment."),
    ).toBeInTheDocument()
  })
})

import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { createInMemoryAnnonceGateway } from '#/features/annonce/in-memory-annonce-gateway'
import { desAnnonces, lieux, uneAnnonce } from '#/test/annonces'
import { renderRoute } from '#/test/renderRoute'
import type { Annonce } from '#/features/annonce/annonce-gateway'

const renderRecherche = (path: string, annonces: Array<Annonce>) =>
  renderRoute(path, {
    gateways: { annonce: createInMemoryAnnonceGateway({ annonces }) },
  })

const vehicules = { code: 'vehicules', libelle: 'Véhicules' }

const resultats = () => screen.getByRole('list', { name: 'Résultats' })

const prixText = (expected: string) => (text: string) =>
  text.replace(/\s/g, ' ') === expected

describe('Recherche page', () => {
  it('lists the annonces matching the mot-cle of the URL, with their total', async () => {
    const velo = uneAnnonce({ titre: 'Vélo Électrique', prix: 0 })
    const course = uneAnnonce({ titre: 'Vélo électrique de course' })
    const canape = uneAnnonce({ titre: 'Canapé', description: 'Trois places.' })

    await renderRecherche('/recherche?motCle=velo+electrique', [
      velo,
      course,
      canape,
    ])

    expect(
      await screen.findByRole('heading', { name: '2 annonces' }),
    ).toBeInTheDocument()
    const cards = within(resultats()).getAllByRole('listitem')
    expect(cards).toHaveLength(2)
    expect(screen.queryByText('Canapé')).not.toBeInTheDocument()
    expect(screen.getByRole('searchbox', { name: 'Mot-clé' })).toHaveValue(
      'velo electrique',
    )
  })

  it('shows the titre, prix, ville, date and placeholder of each result', async () => {
    await renderRecherche('/recherche', [
      uneAnnonce({ titre: 'Vélo électrique', prix: 89000 }),
      uneAnnonce({ titre: 'Lot de livres', prix: 0 }),
    ])

    const velo = await screen.findByRole('link', { name: /Vélo électrique/ })
    expect(within(velo).getByText(prixText('890 €'))).toBeInTheDocument()
    expect(within(velo).getByText('Saint-Étienne')).toBeInTheDocument()
    expect(within(velo).getByText('2 novembre 2026')).toBeInTheDocument()
    expect(within(velo).getByRole('img')).toHaveAttribute('alt', 'Pas de photo')
    const livres = screen.getByRole('link', { name: /Lot de livres/ })
    expect(within(livres).getByText('Don')).toBeInTheDocument()
  })

  it('opens the annonce from its result', async () => {
    const velo = uneAnnonce({ titre: 'Vélo électrique' })
    await renderRecherche('/recherche', [velo])

    await userEvent.click(
      await screen.findByRole('link', { name: /Vélo électrique/ }),
    )

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Vélo électrique' }),
    ).toBeInTheDocument()
    expect(screen.getByText('stephanois')).toBeInTheDocument()
  })

  it('says so when nothing matches', async () => {
    await renderRecherche('/recherche?motCle=licorne', [uneAnnonce()])

    expect(
      await screen.findByText(
        'Aucune annonce ne correspond à votre recherche.',
      ),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('navigation', { name: /pagination/i }),
    ).not.toBeInTheDocument()
  })

  it('serves the page of the URL and paginates twenty a page', async () => {
    await renderRecherche('/recherche?page=2', desAnnonces(25))

    expect(
      await screen.findByRole('heading', { name: '25 annonces' }),
    ).toBeInTheDocument()
    const titres = within(resultats())
      .getAllByRole('heading')
      .map((h) => h.textContent)
    expect(titres).toEqual([
      'Annonce 04',
      'Annonce 03',
      'Annonce 02',
      'Annonce 01',
      'Annonce 00',
    ])
  })

  it('moves to another page from the pagination', async () => {
    await renderRecherche('/recherche', desAnnonces(25))
    expect(await screen.findByText('Annonce 24')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Page 2' }))

    expect(await screen.findByText('Annonce 00')).toBeInTheDocument()
    expect(screen.queryByText('Annonce 24')).not.toBeInTheDocument()
  })

  it('falls back to the first page when the page of the URL is unusable', async () => {
    await renderRecherche('/recherche?page=abc', desAnnonces(3))

    expect(await screen.findByText('Annonce 02')).toBeInTheDocument()
  })

  it('searches again from the search bar, back to the first page', async () => {
    await renderRecherche('/recherche?page=2', [
      ...desAnnonces(25),
      uneAnnonce({ titre: 'Trottinette' }),
    ])
    const motCle = await screen.findByRole('searchbox', { name: 'Mot-clé' })

    await userEvent.type(motCle, 'trottinette')
    await userEvent.click(screen.getByRole('button', { name: 'Rechercher' }))

    expect(
      await screen.findByRole('heading', { name: '1 annonce' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Trottinette')).toBeInTheDocument()
  })

  it('filters by the categorie and the fourchette de prix of the URL', async () => {
    await renderRecherche(
      '/recherche?motCle=velo&categorie=vehicules&prixMin=100&prixMax=500',
      [
        uneAnnonce({ titre: 'Vélo cargo', prix: 30000, categorie: vehicules }),
        uneAnnonce({
          titre: 'Vélo de luxe',
          prix: 90000,
          categorie: vehicules,
        }),
        uneAnnonce({ titre: 'Vélo de ville', prix: 30000 }),
        uneAnnonce({ titre: 'Scooter', prix: 30000, categorie: vehicules }),
      ],
    )

    expect(
      await screen.findByRole('heading', { name: '1 annonce' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Vélo cargo')).toBeInTheDocument()
    expect(screen.getByLabelText('Catégorie')).toHaveValue('vehicules')
    expect(screen.getByRole('textbox', { name: 'Prix min (€)' })).toHaveValue(
      '100',
    )
    expect(screen.getByRole('textbox', { name: 'Prix max (€)' })).toHaveValue(
      '500',
    )
  })

  it('finds only the dons for a fourchette from 0 to 0', async () => {
    await renderRecherche('/recherche?prixMin=0&prixMax=0', [
      uneAnnonce({ titre: 'Lot de livres', prix: 0 }),
      uneAnnonce({ titre: 'Vélo de ville', prix: 1 }),
    ])

    expect(
      await screen.findByRole('heading', { name: '1 annonce' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Lot de livres')).toBeInTheDocument()
  })

  it('ignores an unknown categorie and an unusable prix in the URL', async () => {
    await renderRecherche('/recherche?categorie=licornes&prixMin=abc', [
      uneAnnonce(),
      uneAnnonce({ categorie: vehicules }),
    ])

    expect(
      await screen.findByRole('heading', { name: '2 annonces' }),
    ).toBeInTheDocument()
  })

  it('applies the filters typed in euros, back to the first page', async () => {
    await renderRecherche('/recherche?page=2', [
      ...desAnnonces(25),
      uneAnnonce({ titre: 'Vélo cargo', prix: 45050, categorie: vehicules }),
      uneAnnonce({ titre: 'Voiture', prix: 500000, categorie: vehicules }),
    ])
    const user = userEvent.setup()
    await screen.findByRole('heading', { name: '27 annonces' })

    await user.selectOptions(screen.getByLabelText('Catégorie'), 'vehicules')
    await user.type(
      screen.getByRole('textbox', { name: 'Prix min (€)' }),
      '450,50',
    )
    await user.type(
      screen.getByRole('textbox', { name: 'Prix max (€)' }),
      '1000',
    )
    await user.click(screen.getByRole('button', { name: 'Rechercher' }))

    expect(
      await screen.findByRole('heading', { name: '1 annonce' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Vélo cargo')).toBeInTheDocument()
    expect(
      screen.queryByRole('navigation', { name: /pagination/i }),
    ).not.toBeInTheDocument()
  })

  it('goes back to every categorie', async () => {
    await renderRecherche('/recherche?categorie=vehicules', [
      uneAnnonce(),
      uneAnnonce({ categorie: vehicules }),
    ])
    const user = userEvent.setup()
    await screen.findByRole('heading', { name: '1 annonce' })

    await user.selectOptions(screen.getByLabelText('Catégorie'), '')
    await user.click(screen.getByRole('button', { name: 'Rechercher' }))

    expect(
      await screen.findByRole('heading', { name: '2 annonces' }),
    ).toBeInTheDocument()
  })

  it('refuses a prix that is no amount or a minimum above the maximum', async () => {
    await renderRecherche('/recherche', [uneAnnonce(), uneAnnonce()])
    const user = userEvent.setup()
    await screen.findByRole('heading', { name: '2 annonces' })

    await user.type(
      screen.getByRole('textbox', { name: 'Prix min (€)' }),
      'dix',
    )
    await user.click(screen.getByRole('button', { name: 'Rechercher' }))

    expect(
      await screen.findByText(
        'Le prix doit être un montant en euros, par exemple 12,50',
      ),
    ).toBeInTheDocument()

    const prixMin = screen.getByRole('textbox', { name: 'Prix min (€)' })
    await user.clear(prixMin)
    await user.type(prixMin, '500')
    await user.type(
      screen.getByRole('textbox', { name: 'Prix max (€)' }),
      '100',
    )
    await user.click(screen.getByRole('button', { name: 'Rechercher' }))

    expect(
      await screen.findByText(
        'Le prix minimum ne peut pas dépasser le prix maximum',
      ),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: '2 annonces' }),
    ).toBeInTheDocument()
  })

  describe('lieu', () => {
    const lampes = () => [
      uneAnnonce({
        titre: 'Lampe dionysienne',
        localisation: lieux.saintDenis93,
      }),
      uneAnnonce({
        titre: 'Lampe réunionnaise',
        localisation: lieux.saintDenis974,
      }),
      uneAnnonce({ titre: 'Lampe ajaccienne', localisation: lieux.ajaccio }),
      uneAnnonce({ titre: 'Lampe bastiaise', localisation: lieux.bastia }),
    ]
    const lieu = () => screen.getByLabelText('Région ou département')
    const villeOuCodePostal = () =>
      screen.getByRole('textbox', { name: 'Ville ou code postal' })

    it('finds Saint-Denis in La Réunion from the URL', async () => {
      await renderRecherche(
        '/recherche?region=04&villeOuCodePostal=saint+denis',
        lampes(),
      )

      expect(
        await screen.findByRole('heading', { name: '1 annonce' }),
      ).toBeInTheDocument()
      expect(screen.getByText('Lampe réunionnaise')).toBeInTheDocument()
      expect(lieu()).toHaveValue('region:04')
      expect(villeOuCodePostal()).toHaveValue('saint denis')
    })

    it('filters by a departement of Corse', async () => {
      await renderRecherche('/recherche?departement=2B', lampes())

      expect(
        await screen.findByRole('heading', { name: '1 annonce' }),
      ).toBeInTheDocument()
      expect(screen.getByText('Lampe bastiaise')).toBeInTheDocument()
      expect(lieu()).toHaveValue('departement:2B')
    })

    it('finds the annonces of a code postal', async () => {
      await renderRecherche('/recherche?villeOuCodePostal=93200', lampes())

      expect(
        await screen.findByRole('heading', { name: '1 annonce' }),
      ).toBeInTheDocument()
      expect(screen.getByText('Lampe dionysienne')).toBeInTheDocument()
    })

    it('finds nothing for an incoherent lieu, without an error', async () => {
      await renderRecherche(
        '/recherche?departement=2A&villeOuCodePostal=Saint-Denis',
        lampes(),
      )

      expect(
        await screen.findByText(
          'Aucune annonce ne correspond à votre recherche.',
        ),
      ).toBeInTheDocument()
    })

    it('ignores an unknown region in the URL', async () => {
      await renderRecherche('/recherche?region=99', lampes())

      expect(
        await screen.findByRole('heading', { name: '4 annonces' }),
      ).toBeInTheDocument()
    })

    it('offers the regions, then their departements', async () => {
      await renderRecherche('/recherche', lampes())
      await screen.findByRole('heading', { name: '4 annonces' })

      const corse = within(lieu()).getByRole('group', { name: 'Corse' })
      expect(
        within(corse)
          .getAllByRole('option')
          .map((option) => option.textContent),
      ).toEqual([
        'Corse (toute la région)',
        'Corse-du-Sud (2A)',
        'Haute-Corse (2B)',
      ])
      expect(lieu()).toHaveValue('')
    })

    it('applies the lieu typed in the bar, back to the first page', async () => {
      await renderRecherche('/recherche?page=2', [
        ...desAnnonces(25),
        ...lampes(),
      ])
      const user = userEvent.setup()
      await screen.findByRole('heading', { name: '29 annonces' })

      await user.selectOptions(lieu(), 'departement:93')
      await user.type(villeOuCodePostal(), 'Saint-Denis')
      await user.click(screen.getByRole('button', { name: 'Rechercher' }))

      expect(
        await screen.findByRole('heading', { name: '1 annonce' }),
      ).toBeInTheDocument()
      expect(screen.getByText('Lampe dionysienne')).toBeInTheDocument()
      expect(
        screen.queryByRole('navigation', { name: /pagination/i }),
      ).not.toBeInTheDocument()
    })

    it('combines the lieu with the other criteria', async () => {
      await renderRecherche(
        '/recherche?motCle=lampe&categorie=loisirs&prixMax=1000&region=94',
        [
          ...lampes(),
          uneAnnonce({
            titre: 'Lampe de luxe',
            prix: 200000,
            localisation: lieux.ajaccio,
          }),
        ],
      )

      expect(
        await screen.findByRole('heading', { name: '2 annonces' }),
      ).toBeInTheDocument()
      expect(screen.getByText('Lampe ajaccienne')).toBeInTheDocument()
      expect(screen.getByText('Lampe bastiaise')).toBeInTheDocument()
    })
  })
})

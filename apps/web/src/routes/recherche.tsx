import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Pagination } from '@spark-ui/components/pagination'
import { AnnonceGrid } from '#/components/AnnonceCard'
import { RechercheForm } from '#/components/RechercheForm'
import {
  rechercherAnnoncesQueryOptions,
  regionsQueryOptions,
} from '#/features/annonce/queries'
import {
  criteresDeRecherche,
  rechercheSearchSchema,
} from '#/features/annonce/schemas'
import type { ResultatRecherche } from '#/features/annonce/annonce-gateway'

export const Route = createFileRoute('/recherche')({
  validateSearch: (search) => rechercheSearchSchema.parse(search),
  loaderDeps: ({ search }) => search,
  // The régions come first: a lieu they do not hold is dropped.
  loader: async ({ context, deps }) => {
    const regions = await context.queryClient.ensureQueryData(
      regionsQueryOptions(context.gateways.annonce),
    )
    return context.queryClient.ensureQueryData(
      rechercherAnnoncesQueryOptions(
        context.gateways.annonce,
        criteresDeRecherche(deps, regions),
      ),
    )
  },
  head: () => ({ meta: [{ title: 'Rechercher des annonces' }] }),
  component: RecherchePage,
})

function RecherchePage() {
  const { gateways } = Route.useRouteContext()
  const search = Route.useSearch()
  const { data: regions } = useSuspenseQuery(
    regionsQueryOptions(gateways.annonce),
  )
  const { data: resultat } = useSuspenseQuery(
    rechercherAnnoncesQueryOptions(
      gateways.annonce,
      criteresDeRecherche(search, regions),
    ),
  )
  const { page: _page, ...criteres } = search

  return (
    <main className="page-wrap flex flex-col gap-xl px-lg pt-2xl pb-2xl">
      {/* Keyed on the criteria: the bar shows those of the URL. */}
      <RechercheForm
        key={JSON.stringify(criteres)}
        regions={regions}
        criteres={criteres}
        avecPrix
      />

      <h1 className="text-headline-1">
        {resultat.total} annonce{resultat.total > 1 ? 's' : ''}
      </h1>

      {resultat.annonces.length === 0 ? (
        <p className="text-body-1 text-on-surface/dim-1">
          Aucune annonce ne correspond à votre recherche.
        </p>
      ) : (
        <AnnonceGrid annonces={resultat.annonces} label="Résultats" />
      )}

      <PaginationRecherche resultat={resultat} />
    </main>
  )
}

function PaginationRecherche({ resultat }: { resultat: ResultatRecherche }) {
  const navigate = useNavigate({ from: Route.fullPath })
  if (resultat.total <= resultat.parPage) {
    return null
  }

  return (
    <Pagination
      aria-label="Pagination"
      type="button"
      count={resultat.total}
      pageSize={resultat.parPage}
      page={resultat.page}
      onPageChange={({ page }) =>
        void navigate({
          search: (prev) => ({ ...prev, page: page > 1 ? page : undefined }),
        })
      }
      className="self-center"
    >
      <Pagination.PrevTrigger aria-label="Page précédente" />
      <Pagination.Pages>
        {({ pages }) =>
          pages.map((item, index) =>
            item.type === 'page' ? (
              <Pagination.Item
                key={item.value}
                value={item.value}
                aria-label={`Page ${item.value}`}
              />
            ) : (
              <Pagination.Ellipsis key={`ellipsis-${index}`} index={index} />
            ),
          )
        }
      </Pagination.Pages>
      <Pagination.NextTrigger aria-label="Page suivante" />
    </Pagination>
  )
}

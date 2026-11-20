import { useSuspenseQuery } from '@tanstack/react-query'
import { Link, createFileRoute } from '@tanstack/react-router'
import { AnnonceGrid } from '#/components/AnnonceCard'
import { RechercheForm } from '#/components/RechercheForm'
import {
  rechercherAnnoncesQueryOptions,
  regionsQueryOptions,
} from '#/features/annonce/queries'

// The latest annonces: the first page of a recherche without criteria.
const dernieres = {}

export const Route = createFileRoute('/')({
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(
        rechercherAnnoncesQueryOptions(context.gateways.annonce, dernieres),
      ),
      context.queryClient.ensureQueryData(
        regionsQueryOptions(context.gateways.annonce),
      ),
    ]),
  component: Homepage,
})

function Homepage() {
  const { gateways } = Route.useRouteContext()
  const { data: resultat } = useSuspenseQuery(
    rechercherAnnoncesQueryOptions(gateways.annonce, dernieres),
  )
  const { data: regions } = useSuspenseQuery(
    regionsQueryOptions(gateways.annonce),
  )

  return (
    <main className="page-wrap flex flex-col gap-2xl px-lg pt-3xl pb-2xl">
      <section className="flex flex-col gap-xl rounded-xl border-sm border-outline bg-surface px-xl py-2xl text-on-surface sm:px-3xl">
        <h1 className="text-display-2 sm:text-display-1">
          Achetez et vendez d'occasion près de chez vous.
        </h1>
        <RechercheForm regions={regions} />
      </section>

      <section className="flex flex-col gap-lg">
        <div className="flex items-baseline justify-between gap-md">
          <h2 className="text-headline-1">Dernières annonces</h2>
          {resultat.total > resultat.annonces.length && (
            <Link to="/recherche" className="text-body-2-highlight text-main">
              Voir toutes les annonces
            </Link>
          )}
        </div>
        {resultat.annonces.length === 0 ? (
          <p className="text-body-1 text-on-surface/dim-1">
            Aucune annonce n'est en ligne pour le moment.
          </p>
        ) : (
          <AnnonceGrid
            annonces={resultat.annonces}
            label="Dernières annonces"
          />
        )}
      </section>
    </main>
  )
}

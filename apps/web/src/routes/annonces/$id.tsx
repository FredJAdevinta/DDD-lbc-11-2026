import { useSuspenseQuery } from '@tanstack/react-query'
import { Link, createFileRoute, notFound } from '@tanstack/react-router'
import { Button } from '@spark-ui/components/button'
import { Card } from '@spark-ui/components/card'
import { Divider } from '@spark-ui/components/divider'
import { Tag } from '@spark-ui/components/tag'
import placeholder from '#/assets/annonce-placeholder.svg'
import { formatDeposeeLe, formatPrix } from '#/features/annonce/format'
import { annonceQueryOptions } from '#/features/annonce/queries'
import type { Annonce } from '#/features/annonce/annonce-gateway'

export const Route = createFileRoute('/annonces/$id')({
  loader: async ({ context, params }) => {
    const annonce = await context.queryClient.ensureQueryData(
      annonceQueryOptions(context.gateways.annonce, params.id),
    )
    if (!annonce) {
      throw notFound()
    }
    return { titre: annonce.titre }
  },
  head: ({ loaderData }) => ({
    meta: [{ title: loaderData ? loaderData.titre : 'Annonce introuvable' }],
  }),
  component: AnnoncePage,
  notFoundComponent: AnnonceIntrouvable,
})

function AnnoncePage() {
  const { gateways } = Route.useRouteContext()
  const { id } = Route.useParams()
  const { data: annonce } = useSuspenseQuery(
    annonceQueryOptions(gateways.annonce, id),
  )

  if (!annonce) {
    return <AnnonceIntrouvable />
  }
  return <AnnonceDetail annonce={annonce} />
}

function AnnonceDetail({ annonce }: { annonce: Annonce }) {
  const { localisation } = annonce
  const image = annonce.images.at(0)

  return (
    <main className="page-wrap px-lg pt-2xl pb-2xl">
      <article className="grid gap-xl md:grid-cols-[3fr_2fr]">
        <div className="overflow-hidden rounded-xl bg-neutral-container">
          {image ? (
            <img
              src={image}
              alt={annonce.titre}
              className="aspect-[4/3] w-full object-cover"
            />
          ) : (
            <img
              src={placeholder}
              alt="Pas de photo"
              className="aspect-[4/3] w-full object-cover"
            />
          )}
        </div>

        <Card design="outlined" intent="surface">
          <Card.Content className="flex flex-col gap-lg">
            <Tag design="tinted" intent="support" className="self-start">
              {annonce.categorie.libelle}
            </Tag>
            <h1 className="text-display-3">{annonce.titre}</h1>
            <p className="text-headline-1 text-main">
              {formatPrix(annonce.prix)}
            </p>
            <p className="text-body-2 text-on-surface/dim-1">
              Déposée le {formatDeposeeLe(annonce.deposeeLe)}
            </p>

            <Divider />

            <dl className="grid grid-cols-[auto_1fr] gap-x-lg gap-y-md text-body-1">
              <dt className="text-on-surface/dim-1">Vendeur</dt>
              <dd className="text-body-1-highlight">
                {annonce.vendeur.pseudo}
              </dd>
              <dt className="text-on-surface/dim-1">Ville</dt>
              <dd>
                {localisation.ville} {localisation.codePostal}
              </dd>
              <dt className="text-on-surface/dim-1">Lieu</dt>
              <dd>
                {localisation.departement.nom} ({localisation.departement.code}
                ), {localisation.region.nom}
              </dd>
            </dl>
          </Card.Content>
        </Card>

        <section className="md:col-span-2">
          <h2 className="mb-md text-headline-2">Description</h2>
          <p className="whitespace-pre-line text-body-1">
            {annonce.description}
          </p>
        </section>
      </article>
    </main>
  )
}

function AnnonceIntrouvable() {
  return (
    <main className="page-wrap px-lg pt-3xl pb-2xl">
      <section className="flex flex-col items-start gap-lg rounded-xl border-sm border-outline bg-surface px-xl py-3xl text-on-surface">
        <h1 className="text-display-2">Annonce introuvable</h1>
        <p className="text-body-1 text-on-surface/dim-1">
          Cette annonce n'existe pas ou n'est plus en ligne.
        </p>
        <Button asChild>
          <Link to="/">Retour à l'accueil</Link>
        </Button>
      </section>
    </main>
  )
}

import { Link } from '@tanstack/react-router'
import placeholder from '#/assets/annonce-placeholder.svg'
import { formatDeposeeLe, formatPrix } from '#/features/annonce/format'
import type { AnnonceResume } from '#/features/annonce/annonce-gateway'

// A grid of annonce cards, each leading to the view of its annonce.
export function AnnonceGrid({
  annonces,
  label,
}: {
  annonces: Array<AnnonceResume>
  label: string
}) {
  return (
    <ul
      aria-label={label}
      className="grid grid-cols-1 gap-lg sm:grid-cols-2 lg:grid-cols-4"
    >
      {annonces.map((annonce) => (
        <li key={annonce.id}>
          <AnnonceCard annonce={annonce} />
        </li>
      ))}
    </ul>
  )
}

function AnnonceCard({ annonce }: { annonce: AnnonceResume }) {
  const image = annonce.images.at(0)

  return (
    <Link
      to="/annonces/$id"
      params={{ id: annonce.id }}
      className="flex h-full flex-col overflow-hidden rounded-lg border-sm border-outline bg-surface text-on-surface no-underline hover:border-outline-high"
    >
      <img
        src={image ?? placeholder}
        alt={image ? annonce.titre : 'Pas de photo'}
        className="aspect-[4/3] w-full bg-neutral-container object-cover"
      />
      <div className="flex flex-col gap-sm p-md">
        <h3 className="text-body-1-highlight">{annonce.titre}</h3>
        <p className="text-headline-2 text-main">{formatPrix(annonce.prix)}</p>
        <p className="text-body-2 text-on-surface/dim-1">{annonce.ville}</p>
        <p className="text-caption text-on-surface/dim-1">
          {formatDeposeeLe(annonce.deposeeLe)}
        </p>
      </div>
    </Link>
  )
}

import { Button } from '@spark-ui/components/button'
import { FormField } from '@spark-ui/components/form-field'
import { Input } from '@spark-ui/components/input'
import { Select } from '@spark-ui/components/select'
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { categories } from '#/features/annonce/categories'
import { eurosEnCentimes } from '#/features/annonce/schemas'
import type { RegionAvecDepartements } from '#/features/annonce/annonce-gateway'
import type { RechercheSearch } from '#/features/annonce/schemas'

// The criteria the bar shows, as the URL of /recherche carries them: the prix
// bounds in euros.
export type CriteresSaisis = Pick<
  RechercheSearch,
  | 'motCle'
  | 'categorie'
  | 'prixMin'
  | 'prixMax'
  | 'region'
  | 'departement'
  | 'villeOuCodePostal'
>

// The lieu selector holds one value for a région or a département:
// `region:84` or `departement:2A`.
const valeurDeLieu = ({ region, departement }: CriteresSaisis) =>
  region ? `region:${region}` : departement ? `departement:${departement}` : ''

function lireLieu(valeur: string): {
  region?: string
  departement?: string
} {
  const [type, code] = valeur.split(':')
  if (type === 'region' && code) {
    return { region: code }
  }
  if (type === 'departement' && code) {
    return { departement: code }
  }
  return {}
}

type ErreursPrix = { prixMin?: string; prixMax?: string }

// A bound of the URL as the acheteur types it, with a decimal comma.
const enTexte = (euros: number | undefined) =>
  euros === undefined ? '' : String(euros).replace('.', ',')

// Reads a bound typed in euros: undefined when blank, null when it is no
// amount.
function lireBorne(saisie: string): number | undefined | null {
  if (saisie.trim() === '') {
    return undefined
  }
  const centimes = eurosEnCentimes(saisie)
  return centimes === undefined ? null : centimes / 100
}

// The search bar: sends the acheteur to /recherche with every criterion in
// the URL, back to the first page. `regions` feed the lieu selector;
// `avecPrix` adds the fourchette de prix.
export function RechercheForm({
  regions,
  criteres = {},
  avecPrix = false,
}: {
  regions: Array<RegionAvecDepartements>
  criteres?: CriteresSaisis
  avecPrix?: boolean
}) {
  const navigate = useNavigate()
  const [motCle, setMotCle] = useState(criteres.motCle ?? '')
  const [categorie, setCategorie] = useState(criteres.categorie ?? '')
  const [lieu, setLieu] = useState(valeurDeLieu(criteres))
  const [villeOuCodePostal, setVilleOuCodePostal] = useState(
    criteres.villeOuCodePostal ?? '',
  )
  const [prixMin, setPrixMin] = useState(enTexte(criteres.prixMin))
  const [prixMax, setPrixMax] = useState(enTexte(criteres.prixMax))
  const [erreurs, setErreurs] = useState<ErreursPrix>({})

  const rechercher = (event: FormEvent) => {
    event.preventDefault()
    const min = lireBorne(prixMin)
    const max = lireBorne(prixMax)
    const nouvellesErreurs: ErreursPrix = {}
    const pasUnMontant =
      'Le prix doit être un montant en euros, par exemple 12,50'
    if (min === null) {
      nouvellesErreurs.prixMin = pasUnMontant
    }
    if (max === null) {
      nouvellesErreurs.prixMax = pasUnMontant
    }
    if (min != null && max != null && min > max) {
      nouvellesErreurs.prixMin =
        'Le prix minimum ne peut pas dépasser le prix maximum'
    }
    setErreurs(nouvellesErreurs)
    if (Object.keys(nouvellesErreurs).length > 0) {
      return
    }
    void navigate({
      to: '/recherche',
      search: {
        motCle: motCle.trim() || undefined,
        categorie: categorie || undefined,
        prixMin: min ?? undefined,
        prixMax: max ?? undefined,
        ...lireLieu(lieu),
        villeOuCodePostal: villeOuCodePostal.trim() || undefined,
      },
    })
  }

  return (
    <form
      role="search"
      onSubmit={rechercher}
      noValidate
      className={`grid grid-cols-1 items-start gap-md sm:grid-cols-2 ${
        avecPrix ? 'lg:grid-cols-3' : 'lg:grid-cols-4'
      }`}
    >
      <FormField
        name="motCle"
        className="flex flex-col gap-sm sm:col-span-full"
      >
        <FormField.Label>Mot-clé</FormField.Label>
        <Input
          type="search"
          value={motCle}
          placeholder="Que recherchez-vous ?"
          onValueChange={setMotCle}
        />
      </FormField>
      <FormField name="categorie" className="flex flex-col gap-sm">
        <FormField.Label>Catégorie</FormField.Label>
        <Select value={categorie} onValueChange={setCategorie}>
          <Select.Trigger>
            <Select.Value placeholder="Toutes les catégories" />
          </Select.Trigger>
          <Select.Items>
            <Select.Placeholder>Toutes les catégories</Select.Placeholder>
            {categories.map(({ code, libelle }) => (
              <Select.Item key={code} value={code}>
                {libelle}
              </Select.Item>
            ))}
          </Select.Items>
        </Select>
      </FormField>
      <FormField name="lieu" className="flex flex-col gap-sm">
        <FormField.Label>Région ou département</FormField.Label>
        <Select value={lieu} onValueChange={setLieu}>
          <Select.Trigger>
            <Select.Value placeholder="Toute la France" />
          </Select.Trigger>
          <Select.Items>
            <Select.Placeholder>Toute la France</Select.Placeholder>
            {regions.map((region) => (
              <Select.Group key={region.code}>
                <Select.Label>{region.nom}</Select.Label>
                <Select.Item value={`region:${region.code}`}>
                  {`${region.nom} (toute la région)`}
                </Select.Item>
                {region.departements.map(({ code, nom }) => (
                  <Select.Item key={code} value={`departement:${code}`}>
                    {`${nom} (${code})`}
                  </Select.Item>
                ))}
              </Select.Group>
            ))}
          </Select.Items>
        </Select>
      </FormField>
      <FormField name="villeOuCodePostal" className="flex flex-col gap-sm">
        <FormField.Label>Ville ou code postal</FormField.Label>
        <Input value={villeOuCodePostal} onValueChange={setVilleOuCodePostal} />
      </FormField>
      {avecPrix && (
        <>
          <ChampPrix
            name="prixMin"
            label="Prix min (€)"
            value={prixMin}
            erreur={erreurs.prixMin}
            onValueChange={setPrixMin}
          />
          <ChampPrix
            name="prixMax"
            label="Prix max (€)"
            value={prixMax}
            erreur={erreurs.prixMax}
            onValueChange={setPrixMax}
          />
        </>
      )}
      <Button type="submit" className="w-full sm:mt-xl">
        Rechercher
      </Button>
    </form>
  )
}

function ChampPrix({
  name,
  label,
  value,
  erreur,
  onValueChange,
}: {
  name: string
  label: string
  value: string
  erreur?: string
  onValueChange: (value: string) => void
}) {
  return (
    <FormField
      name={name}
      state={erreur ? 'error' : undefined}
      className="flex flex-col gap-sm"
    >
      <FormField.Label>{label}</FormField.Label>
      <Input inputMode="decimal" value={value} onValueChange={onValueChange} />
      {erreur && <FormField.ErrorMessage>{erreur}</FormField.ErrorMessage>}
    </FormField>
  )
}

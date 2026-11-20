# annonce

The core bounded context: the annonces vendeurs put up for sale and acheteurs consult. It knows nothing of accounts, moderation or messaging; those will react to its events.

## Language

Shared terms: [`domain.md`](../../../../documentation/glossary/domain.md), [`technical.md`](../../../../documentation/glossary/technical.md).

- `NewAnnonceArgs` — the primitives an `Annonce` is built from, shared by `NewAnnonce` and `RestoreAnnonce`.
- `RestoreAnnonce` — rebuilds an annonce whose ID and `Statut` are known (persistence, tests); `NewAnnonce` always makes a fresh UUID, `Activee`.

## Boundaries

- Driving: the HTTP handler (`GET /annonces`, `GET /annonces/{id}`, `POST /annonces`, `GET /regions`, mounted by `RegisterRoutes`). No consumer yet.
- Events produced: `AnnonceDeposee` (carries the `*Annonce`), on the async bus of `main.go`; no subscriber yet, moderation will be the first. Events consumed: none.
- Demo annonces are seeded by the composition root (`cmd/api/demo_annonces.go`), not by this context.

## Flows

- Déposer annonce: `NewAnnonce` (dated by the injected clock, `Activee`) → `Save` → publish `AnnonceDeposee` → the ID, answered `201 {"id"}`. A validation error is a 400 `{"erreur", "champ"}`, `champ` being the JSON key at fault (table `invalidFields` in the handler); a missing `prix` is refused by the handler, not taken as a don.
- Rechercher annonces: `GET /annonces?motCle=&categorie=&prixMin=&prixMax=&region=&departement=&villeOuCodePostal=&page=` → `NewCriteresRecherche` + `NewPage` → `AnnonceRepository.Rechercher` (filter with `CriteresRecherche.Retient`, newest `deposeeLe` first, `ParPage` = 20) → `{"annonces", "total", "page", "parPage"}`. A page past the last is an empty list, not an error; a negative or non-integer page is a 400 on `champ` `page`. Prix bounds are integer centimes, both included (0–0 finds the dons); a negative or non-integer bound is a 400 on `prixMin`/`prixMax`, a minimum above the maximum a 400 on `prixMin`, an unknown catégorie a 400 on `categorie`. An unknown région or département is a 400 on `region`/`departement`, both at once a 400 on `region` (`ErrLieuAmbigu`); an incoherent lieu (Ajaccio in 93) is zero results, no error.
- Lister régions: `GET /regions` → `[{"code", "nom", "departements": [{"code", "nom"}]}]`, from the static table; feeds the lieu selector.
- Consulter annonce: `ParseAnnonceID` → `GetByID` → `EstActivee` → `AnnonceView`. A malformed ID is `ErrIDAnnonceInvalide` (400); unknown or not activee is `ErrAnnonceIntrouvable` (404).

## Invariants and pitfalls

- **A view never exposes the vendeur's email or telephone**: only the pseudo leaves the domain.
- **A non-activee annonce answers `ErrAnnonceIntrouvable`**, never a distinct error: its existence must not leak.
- **Prix is in centimes**, zero is a don, no ceiling. The frontend converts to euros.
- **Catégorie codes are stable** (`vehicules`, `maison-jardin`…): they travel in JSON and URLs; only the libellé is French prose.
- **Département from the code postal**: two-digit prefix 01–95; Corse splits on the third digit (200–201 → 2A, 202–206 → 2B, 207–209 rejected); overseas reads three digits, 971–974 and 976. 975 (Saint-Pierre-et-Miquelon) is no département and is rejected, as are 00, 96, 98, 99.
- **Région and département codes are INSEE codes**; the full table is `domain/departement.go`.
- **Validation lives in the constructors**: titre 3–100 and description 10–4 000 characters (runes, trimmed), pseudo 2–30, bare email, telephone `0` + 9 digits once spaces, dots and dashes are dropped. The web schema mirrors these rules: change both together.
- **A new domain error needs its line in `invalidFields`**, or the form gets a 500 instead of a message under the field.
- **`CriteresRecherche` holds every search criterion**: a new filter joins `CriteresRechercheArgs` and `Retient`, not a new repository method. `Retient` also enforces "activee only".
- **`villeOuCodePostal`**: five digits (trimmed) are compared exactly to the code postal, never as a prefix; anything else must equal the normalised ville as a whole (« Paris » does not find « Paris 15e »).
- **`ErrCodeDepartementInconnu` is not `ErrDepartementInconnu`**: the first is an unknown code in a recherche, the second a code postal that points to no département in a dépôt.
- **Text comparison goes through `normaliser`** (`domain/normalisation.go`): lower case, accents dropped by a table (no `x/text`), hyphens and apostrophes as spaces. A mot-clé word matches as a substring, so `elec` finds « électrique ».
- **The list view is `AnnonceResumeView`**: titre, prix, ville, images, date; no vendeur at all.
- **JSON keys are French** and errors answer `{"erreur": "…"}` in French.

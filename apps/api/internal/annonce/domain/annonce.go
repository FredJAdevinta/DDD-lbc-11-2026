package domain

import (
	"strings"
	"time"
	"unicode/utf8"

	"github.com/google/uuid"
)

// Statut of an annonce. Activee is the only one so far: moderation will add
// the others.
type Statut string

const Activee Statut = "Activee"

// Annonce is the aggregate root: a good a vendeur puts up for sale.
type Annonce struct {
	id           string
	titre        string
	description  string
	prix         Prix
	categorie    Categorie
	localisation Localisation
	vendeur      Vendeur
	images       []string
	deposeeLe    time.Time
	statut       Statut
}

// Lengths of the titre and the description, counted in characters once
// trimmed.
const (
	titreMin       = 3
	titreMax       = 100
	descriptionMin = 10
	descriptionMax = 4000
)

// NewAnnonceArgs carries the primitives an annonce is built from.
type NewAnnonceArgs struct {
	Titre       string
	Description string
	Prix        int64
	Categorie   string
	Ville       string
	CodePostal  string
	Pseudo      string
	Email       string
	Telephone   string
	DeposeeLe   time.Time
}

// NewAnnonce builds an annonce with a fresh ID, activee from the start.
func NewAnnonce(args NewAnnonceArgs) (*Annonce, error) {
	return RestoreAnnonce(uuid.NewString(), Activee, args)
}

// RestoreAnnonce rebuilds an annonce whose ID and statut are already known,
// as a persistence adapter does when it loads one.
func RestoreAnnonce(id string, statut Statut, args NewAnnonceArgs) (*Annonce, error) {
	titre := strings.TrimSpace(args.Titre)
	if n := utf8.RuneCountInString(titre); n < titreMin || n > titreMax {
		return nil, ErrTitreInvalide
	}
	description := strings.TrimSpace(args.Description)
	if n := utf8.RuneCountInString(description); n < descriptionMin || n > descriptionMax {
		return nil, ErrDescriptionInvalide
	}
	prix, err := NewPrix(args.Prix)
	if err != nil {
		return nil, err
	}
	categorie, err := NewCategorie(args.Categorie)
	if err != nil {
		return nil, err
	}
	localisation, err := NewLocalisation(args.Ville, args.CodePostal)
	if err != nil {
		return nil, err
	}
	vendeur, err := NewVendeur(args.Pseudo, args.Email, args.Telephone)
	if err != nil {
		return nil, err
	}
	return &Annonce{
		id:           id,
		titre:        titre,
		description:  description,
		prix:         prix,
		categorie:    categorie,
		localisation: localisation,
		vendeur:      vendeur,
		images:       []string{},
		deposeeLe:    args.DeposeeLe,
		statut:       statut,
	}, nil
}

// ParseAnnonceID checks that id is a UUID, the shape of every annonce ID.
func ParseAnnonceID(id string) (string, error) {
	parsed, err := uuid.Parse(id)
	if err != nil {
		return "", ErrIDAnnonceInvalide
	}
	return parsed.String(), nil
}

func (a *Annonce) ID() string                 { return a.id }
func (a *Annonce) Titre() string              { return a.titre }
func (a *Annonce) Description() string        { return a.description }
func (a *Annonce) Prix() Prix                 { return a.prix }
func (a *Annonce) Categorie() Categorie       { return a.categorie }
func (a *Annonce) Localisation() Localisation { return a.localisation }
func (a *Annonce) Vendeur() Vendeur           { return a.vendeur }
func (a *Annonce) Images() []string           { return append([]string{}, a.images...) }
func (a *Annonce) DeposeeLe() time.Time       { return a.deposeeLe }
func (a *Annonce) Statut() Statut             { return a.statut }
func (a *Annonce) EstActivee() bool           { return a.statut == Activee }

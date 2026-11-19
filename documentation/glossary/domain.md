# Glossaire du domaine

Langage ubiquitaire de la place de marché d'occasion, en français : c'est la langue dans laquelle
l'équipe modélise, et le code reprend ces mots sans les traduire. Un seul nom par concept.
Tags (en anglais, ce sont les termes de `technical.md`) : _aggregate_, _value object_, _command_,
_query_, _event_, _rule_, _actor_.

Une entrée dit ce qu'est un terme, en une ou deux phrases, 300 caractères au plus. Un terme mérite
une entrée quand il nomme un agrégat, un sous-domaine ou bounded context, ou un concept clé partagé
par plusieurs modules ou montré aux utilisateurs. Un réglage, une option, une variante d'une autre
entrée ou un détail de règle n'en a pas : sa place est dans l'`AGENTS.md` de son module ou dans le
code. Une entrée se suffit à elle-même : aucun renvoi vers une spec ou un fichier.

Une entrée s'écrit ainsi, sous un titre par sous-domaine :

    - **Annonce déposée** (`AnnonceDeposee`) — _event_. Définition.

Le terme est écrit comme on le dit, avec ses accents ; la parenthèse donne son nom dans le code
quand il diffère (sans accent ni espace). Ajouter un terme dès qu'il est tranché, dans le même
changement que le code qui l'utilise ; ne jamais inventer dans le code un nom absent d'ici, ni le
traduire en anglais.

## Carte du domaine

| Sous-domaine | Type | Bounded context | Agrégats |
| ------------ | ---- | --------------- | -------- |
| Annonce      | cœur | `annonce`       | Annonce  |

## Annonce

- **Annonce** — _aggregate_. Un bien qu'un vendeur met en vente : titre, description, prix,
  catégorie, localisation, vendeur, images et date de dépôt. Seule une annonce activée est visible.
- **Vendeur** — _actor_, _value object_. La personne qui dépose une annonce. Sans compte, elle laisse
  à chaque dépôt un pseudo, un email et, si elle veut, un téléphone ; seul le pseudo est affiché.
- **Activée** (`Activee`) — _rule_. Le statut d'une annonce visible dans la recherche et consultable.
- **Acheteur** — _actor_. La personne qui recherche et consulte des annonces.
- **Prix** — _value object_. Le montant demandé, en centimes d'euro, positif ou nul. Un prix nul
  est un don.
- **Catégorie** (`Categorie`) — _value object_. Le rayon d'une annonce, pris dans une liste fermée
  (Véhicules, Immobilier, Multimédia…). C'est aussi un filtre de recherche.
- **Localisation** — _value object_. Où se trouve le bien : la ville et le code postal saisis par le
  vendeur, le département et la région déduits du code postal.
- **Déposer annonce** (`DeposerAnnonce`) — _command_. Le vendeur publie une nouvelle annonce.
- **Annonce déposée** (`AnnonceDeposee`) — _event_. Une annonce vient d'être déposée.
- **Rechercher annonces** (`RechercherAnnonces`) — _query_. Trouver les annonces visibles par
  mot-clé, catégorie, fourchette de prix, région ou département, et ville ou code postal, les plus
  récentes d'abord.
- **Consulter annonce** (`ConsulterAnnonce`) — _query_. Afficher le détail d'une annonce.

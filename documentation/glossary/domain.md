# Glossaire du domaine

Langage ubiquitaire, en français ; le code reprend ces mots sans accents et sans les traduire. Une
ligne par racine d'agrégat, acteur ou événement : ce qu'il **est**. Ni le détail d'un agrégat, ni
les commandes et requêtes : le code les nomme. Format : `- **Terme** (`NomEnCode`) — définition.`,
la parenthèse seulement si le nom diffère.

## Carte du domaine

| Sous-domaine | Type | Bounded context | Agrégats |
| ------------ | ---- | --------------- | -------- |
| Annonce      | cœur | `annonce`       | Annonce  |

## Annonce

- **Annonce** — un bien qu'un vendeur met en vente.
- **Vendeur** — la personne qui dépose une annonce, sans compte.
- **Acheteur** — la personne qui recherche et consulte des annonces.
- **Annonce déposée** (`AnnonceDeposee`) — l'événement d'un dépôt, auquel la modération se branchera.

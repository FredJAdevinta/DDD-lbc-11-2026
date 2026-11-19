# 06: Filtrer par lieu

**What to build:** l'acheteur restreint les résultats à un lieu de deux façons combinables :

- un sélecteur unique « région ou département » ;
- un champ libre « Ville ou code postal ».

Il peut par exemple chercher « Saint-Denis » dans La Réunion. Ces filtres se combinent avec le mot-clé, la catégorie et le prix, sur `/recherche` comme dans la barre de l'accueil.

**Blocked by:** 04 (Rechercher par mot-clé)

**Status:** ready-for-agent

- [ ] `RechercherAnnonces` accepte soit une région, soit un département, jamais les deux. Une région ou un département inconnu est rejeté avec une erreur explicite.
- [ ] Le champ « Ville ou code postal » fonctionne ainsi :
  - une saisie de 5 chiffres est comparée exactement au code postal ;
  - toute autre saisie est comparée à la ville après normalisation : sans casse ni accents, tirets et apostrophes comptés comme des espaces ;
  - la ville doit être identique après normalisation : « saint etienne » trouve « Saint-Étienne », mais « Paris » ne trouve pas « Paris 15e ».
- [ ] Le lieu et la ville ou le code postal se combinent en ET logique avec tous les autres critères. Une combinaison incohérente renvoie zéro résultat, sans erreur.
- [ ] Ces règles sont testées sur le dépôt en mémoire, y compris les homonymes (Saint-Denis 93 et 974) et la Corse.
- [ ] L'API accepte ces critères en paramètres de requête, et la liste des régions et départements est disponible pour alimenter le sélecteur.
- [ ] La page `/recherche` propose un sélecteur hiérarchique (les régions, puis leurs départements) et le champ « Ville ou code postal ». Tous les critères sont dans l'URL, et changer un filtre revient à la page 1.
- [ ] La barre de recherche de l'accueil propose les mêmes champs de lieu.
- [ ] Les pages sont testées sur une gateway en mémoire.
- [ ] `make check` est vert.

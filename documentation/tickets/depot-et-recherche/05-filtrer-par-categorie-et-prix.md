# 05: Filtrer par catégorie et par prix

**What to build:** sur la page de recherche, l'acheteur restreint les résultats à une catégorie et à une fourchette de prix (min et max, en euros). Ces filtres se combinent avec le mot-clé. La barre de recherche de l'accueil propose aussi la catégorie.

**Blocked by:** 04 (Rechercher par mot-clé)

**Status:** ready-for-agent

- [ ] `RechercherAnnonces` accepte une catégorie (parmi les 8 valeurs) et un prix minimum et/ou maximum en centimes, bornes incluses. Tous les critères se combinent en ET logique.
- [ ] Une catégorie inconnue, ou un minimum supérieur au maximum, est rejeté avec une erreur explicite.
- [ ] Une fourchette 0-0 ne renvoie que les dons.
- [ ] Les combinaisons sont testées sur le dépôt en mémoire.
- [ ] L'API accepte ces critères en paramètres de requête.
- [ ] La page `/recherche` propose un sélecteur de catégorie et deux champs de prix saisis en euros. Tous les critères sont dans l'URL, et changer un filtre revient à la page 1.
- [ ] La barre de recherche de l'accueil propose le sélecteur de catégorie à côté du mot-clé.
- [ ] Les pages sont testées sur une gateway en mémoire.
- [ ] `make check` est vert.

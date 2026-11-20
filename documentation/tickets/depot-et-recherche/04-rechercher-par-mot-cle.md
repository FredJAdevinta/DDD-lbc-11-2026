# 04: Rechercher par mot-clé

**What to build:** un acheteur arrive sur la page d'accueil, voit les 20 dernières annonces et une barre de recherche. Il tape un mot-clé, arrive sur `/recherche` avec les résultats paginés et leur nombre total, et ouvre une annonce. Le lien de la recherche se partage, car les critères sont dans l'URL.

**Blocked by:** 02 (Consulter une annonce)

**Status:** done

- [x] La requête `RechercherAnnonces` ne renvoie que les annonces activées, triées par date de dépôt décroissante, 20 par page, avec le nombre total de résultats et le numéro de page.
- [x] Le mot-clé est cherché dans le titre et la description :
  - sans tenir compte de la casse ni des accents ;
  - chaque mot saisi doit apparaître (ET logique), donc « velo electrique » trouve « Vélo Électrique » ;
  - un mot-clé vide renvoie toutes les annonces activées.
- [x] La recherche est testée sur le dépôt en mémoire : normalisation, ET logique, tri, pagination et exclusion des annonces non activées.
- [x] L'API expose la recherche en lecture, avec les critères et la page en paramètres de requête.
- [x] La page `/recherche` porte le mot-clé et la page dans les paramètres d'URL, validés par un schéma. Elle affiche une liste de résultats (image placeholder, titre, prix ou « Don », ville, date), le total et la pagination Spark.
- [x] Une recherche sans résultat affiche un message dédié.
- [x] La page d'accueil remplace le contrôle de santé de l'API par une barre de recherche (mot-clé) et les 20 dernières annonces. Chaque carte mène à la vue de l'annonce.
- [x] Les deux pages sont testées sur une gateway en mémoire.
- [x] Le glossaire et l'`AGENTS.md` du bounded context `annonce` sont à jour.
- [x] `make check` est vert.

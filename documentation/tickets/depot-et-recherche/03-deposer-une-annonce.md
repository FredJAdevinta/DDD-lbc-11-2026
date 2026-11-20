# 03: Déposer une annonce

**What to build:** un vendeur, sans compte, clique sur « Déposer une annonce », remplit le formulaire (titre, description, prix en euros, catégorie, ville, code postal, pseudo, email, téléphone optionnel) et la publie. Il est redirigé vers la vue de son annonce, déjà visible, avec un toast « Annonce déposée ». Une saisie invalide affiche des messages d'erreur en français sous les champs concernés.

**Blocked by:** 02 (Consulter une annonce)

**Status:** done

- [x] La commande `DeposerAnnonce` crée une annonce directement au statut `Activee`, datée du dépôt, la persiste, puis publie l'événement `AnnonceDeposee` sur le bus d'événements. Aucun consommateur n'existe encore : la modération viendra s'y brancher.
- [x] Le domaine fait respecter les règles suivantes, chacune par une erreur métier dédiée :
  - titre de 3 à 100 caractères ;
  - description de 10 à 4 000 caractères ;
  - prix en centimes, positif ou nul ;
  - catégorie dans la liste fermée ;
  - code postal de 5 chiffres désignant un département ;
  - pseudo de 2 à 30 caractères ;
  - email au format valide ;
  - téléphone optionnel, au format français (10 chiffres commençant par 0).
- [x] Ces règles sont testées dans le domaine, et l'événement émis est vérifié avec le collecteur d'événements.
- [x] L'API accepte le dépôt en JSON (clés en français) et renvoie l'ID de la nouvelle annonce. Chaque erreur métier devient un 400 (ou un 422, à harmoniser avec les conventions de l'API) avec un message exploitable par le formulaire.
- [x] La page `/annonces/deposer` utilise les composants de formulaire Spark. Elle valide avec un schéma Zod qui reprend les règles du domaine pour un retour immédiat, mais c'est l'API qui fait foi, et ses erreurs sont aussi affichées.
- [x] Le prix est saisi en euros (décimales acceptées) et envoyé en centimes. Un prix de 0 est accepté.
- [x] Après le dépôt, la redirection vers `/annonces/$id` affiche un toast Spark « Annonce déposée ».
- [x] Un bouton « Déposer une annonce » dans le header mène au formulaire.
- [x] La page est testée sur une gateway en mémoire : dépôt réussi suivi de la redirection, erreurs de validation affichées.
- [x] Le glossaire et l'`AGENTS.md` du bounded context `annonce` sont à jour (commande, événement, frontières).
- [x] `make check` est vert.

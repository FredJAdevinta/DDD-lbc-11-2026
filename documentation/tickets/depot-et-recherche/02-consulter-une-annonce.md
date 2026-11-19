# 02: Consulter une annonce

**What to build:** un acheteur ouvre l'URL d'une annonce et voit son détail : image (placeholder local), titre, prix en euros (« Don » si le prix est nul), catégorie, description, ville, code postal, département et région, pseudo du vendeur et date de dépôt. Les annonces viennent d'un jeu de démonstration chargé au démarrage de l'API. Premier tracer bullet : il pose l'agrégat `Annonce` et traverse toutes les couches.

**Blocked by:** 01 (Intégrer le design system Spark)

**Status:** ready-for-agent

- [ ] L'agrégat `Annonce` porte : un ID (UUID), un titre, une description, un `Prix`, une `Categorie`, une `Localisation`, un `Vendeur`, des images (liste d'URL, vide pour l'instant), une date de dépôt et un statut. Le seul statut est `Activee`.
- [ ] `Prix` est un montant en centimes d'euro, positif ou nul, sans plafond.
- [ ] `Categorie` est une liste fermée de 8 valeurs, chacune avec un code stable et un libellé : Véhicules, Immobilier, Multimédia, Maison & Jardin, Mode, Loisirs, Emploi & Services, Autres.
- [ ] `Localisation` prend une ville et un code postal de 5 chiffres, et en déduit le département et la région :
  - le département vient du préfixe, de 01 à 95 ;
  - la Corse est un cas particulier : 200-201 donne 2A, 202-206 donne 2B ;
  - pour l'outre-mer, 971 à 976 donnent le département.

  Un préfixe qui ne désigne aucun département est une erreur métier. Ces règles sont testées, y compris les cas Corse et outre-mer.

- [ ] `Vendeur` est un value object : pseudo, email et téléphone optionnel.
- [ ] Un dépôt en mémoire stocke et charge les annonces.
- [ ] La requête `ConsulterAnnonce` renvoie une vue qui expose le pseudo du vendeur, jamais son email ni son téléphone.
- [ ] Une annonce non activée n'est pas consultable.
- [ ] L'API répond à la lecture d'une annonce par ID. Une annonce inconnue donne un 404 et un ID mal formé un 400, en JSON avec des clés en français.
- [ ] Une dizaine d'annonces de démonstration, variées en catégories, prix (dont un don) et régions, sont chargées au démarrage de l'API dans le composition root. Elles sont désactivables par une variable d'environnement et ne sont jamais chargées dans les tests.
- [ ] La page `/annonces/$id` affiche le détail avec les composants Spark et le placeholder local quand l'annonce n'a pas d'image.
- [ ] Une annonce inconnue affiche une page « Annonce introuvable ».
- [ ] La page est testée sur une gateway en mémoire.
- [ ] Les termes nouveaux ou précisés sont dans le glossaire du domaine, et l'`AGENTS.md` du bounded context `annonce` est rempli (rôle, langage, frontières, invariants).
- [ ] `make check` est vert.

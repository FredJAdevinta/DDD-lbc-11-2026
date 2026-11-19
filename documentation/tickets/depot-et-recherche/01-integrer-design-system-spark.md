# 01: Intégrer le design system Spark

**What to build:** le frontend adopte le design system Spark UI de leboncoin (tokens, typographie Nunito Sans, composants) avant le premier écran métier. Le header, le footer et la page d'accueil actuelle passent aux tokens Spark ; l'utilisateur voit la même application, au look leboncoin. C'est une préparation : aucun comportement ne change.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Les paquets Spark UI (composants et thème) sont installés et le thème est importé dans la feuille de style globale ; les composants Spark sont scannés par Tailwind.
- [ ] La police Nunito Sans est chargée et appliquée.
- [ ] Le thème Spark remet à zéro la palette et les échelles par défaut de Tailwind : toutes les classes existantes qui en dépendaient sont remplacées par les tokens Spark, sans rendu cassé.
- [ ] Le header, le footer et la page d'accueil utilisent les tokens et, quand ils existent, les composants Spark (par exemple `Button`).
- [ ] Le thème clair et sombre fonctionne toujours avec le sélecteur de thème existant, ou le sélecteur est retiré s'il ne peut pas suivre Spark (choix noté dans l'`AGENTS.md` du frontend).
- [ ] Les avertissements de peer dependencies de pnpm, s'il y en a, sont compris et documentés dans l'`AGENTS.md` du frontend.
- [ ] Le rendu côté serveur fonctionne (`make dev`, chargement direct de la page d'accueil).
- [ ] Les tests existants passent et `make check` est vert.

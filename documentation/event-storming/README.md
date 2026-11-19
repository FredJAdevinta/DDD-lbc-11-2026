# Event storming

Transcription du mur de l'atelier (18 et 19 novembre 2026), parcours par parcours. Les photos
d'origine sont à côté : [`mur-1-gauche.jpg`](mur-1-gauche.jpg), [`mur-2-droite.jpg`](mur-2-droite.jpg),
[`mur-3-agregats.jpg`](mur-3-agregats.jpg).

**Ce fichier est une trace d'atelier, pas le modèle.** Le texte des post-its est recopié, sauf là où le groupe a précisé un terme depuis.
Le vocabulaire qui fait foi est celui de [`domain.md`](../glossary/domain.md) : un terme n'y entre
que lorsqu'on attaque son parcours. Un parcours ne s'implémente que si un ticket le demande, même
si le mur le décrit.

## Comment lire les diagrammes

| Post-it     | Type            | Dans un diagramme                         |
| ----------- | --------------- | ----------------------------------------- |
| Jaune       | Acteur          | `([Vendeur])`, classe `acteur`            |
| Vert        | Vue             | classe `vue`                              |
| Bleu        | Commande        | classe `commande`                         |
| Orange      | Événement       | classe `evenement`                        |
| Orange      | Tâche programmée (« 60 j passés… ») | `[/…/]`, classe `tache` |
| Jaune foncé | Agrégat         | `[(Annonce)]`, classe `agregat`           |
| Rose        | Système externe | `[[SMTP]]`, classe `externe`              |
| Gris        | Question        | `{{…}}`, classe `question`                |

- Un cadre (`subgraph`) est un **sous-domaine** : Annonce, Modération ou Publicité. Ce qui est hors
  de tout cadre est hors du système.
- `-->` : l'enchaînement sur la timeline.
- `==>` : un événement d'un sous-domaine qui en déclenche un autre **dans un autre sous-domaine**.
- `-.->` : ce qu'une tâche programmée déclenche, ou l'appel à un système externe.
- `(?)` marque une lecture incertaine de la photo.

## Vue d'ensemble

| Sous-domaine | Acteurs              | Agrégats                                                                | Système externe |
| ------------ | -------------------- | ----------------------------------------------------------------------- | --------------- |
| Annonce      | Vendeur, Acheteur    | Annonce                                                                 | SMTP            |
| Modération   | Modérateur, Délateur | File d'attente modération, Historique d'annonce, Modérateur, KPI modé   |                 |
| Publicité    | Régie pub            | aucun sur le mur                                                        | AD-Server       |

La timeline traverse les sous-domaines à huit moments. Ce sont les seuls points de contact entre
eux :

| Dans…      | il se produit…                                    | ce qui déclenche, dans… | …                              | Parcours |
| ---------- | ------------------------------------------------- | ----------------------- | ------------------------------ | -------- |
| Annonce    | Annonce déposée                                   | Modération              | Annonce mise en file de modération | 1   |
| Modération | Annonce validée                                   | Annonce                 | Annonce activée                | 2        |
| Modération | Annonce challengée                                | Annonce                 | Mail annonce challengée envoyé | 2        |
| Annonce    | Annonce corrigée                                  | Modération              | retour dans la file            | 2        |
| Annonce    | Page d'accueil, résultats de recherche, annonce vus | Publicité             | Pub affichée                   | 3        |
| Annonce    | Formulaire de contact soumis                      | Modération              | KPI modé incrémenté            | 3        |
| Modération | Annonce re-signalée                               | Annonce                 | Annonce désactivée             | 4        |
| Annonce    | Annonce archivée                                  | Modération              | Historique annonce supprimé    | 6        |

## Parcours

Le mur modélise l'ensemble ; l'implémentation se fait bout par bout, ticket par ticket.

| #   | Parcours                        | Sous-domaines traversés         |
| --- | ------------------------------- | ------------------------------- |
| 1   | Dépôt d'annonce                 | Annonce → Modération            |
| 2   | Modération                      | Modération ⇄ Annonce            |
| 3   | Recherche, publicité et contact | Annonce → Publicité, Modération |
| 4   | Signalement                     | Modération → Annonce            |
| 5   | Suppression                     | Hors du système → Annonce       |
| 6   | Archivage (expiration)          | Annonce → Modération            |

### 1. Dépôt d'annonce

```mermaid
flowchart LR
  classDef acteur fill:#fff176,stroke:#999,color:#000
  classDef vue fill:#aed581,stroke:#999,color:#000
  classDef commande fill:#4fc3f7,stroke:#999,color:#000
  classDef evenement fill:#ffb74d,stroke:#999,color:#000
  classDef agregat fill:#fbc02d,stroke:#999,color:#000
  classDef externe fill:#f48fb1,stroke:#999,color:#000
  classDef question fill:#bdbdbd,stroke:#999,color:#000

  subgraph ANNONCE["Annonce"]
    vendeur([Vendeur]):::acteur --> accueil
    accueil["Page d'accueil"]:::vue --> formulaire[Formulaire dépôt]:::vue
    formulaire --> deposer[Déposer annonce]:::commande
    deposer --> deposee[Annonce déposée]:::evenement
    deposee --> mailDepot[Email de confirmation de dépôt envoyé]:::evenement
    aAnnonce[(Annonce)]:::agregat
  end

  subgraph MODERATION["Modération"]
    enFile[Annonce mise en file de modération]:::evenement
    aFile[("File d'attente modération")]:::agregat
  end

  deposee ==> enFile
  mailDepot -.-> smtp[[SMTP]]:::externe
```

### 2. Modération

Le modérateur verrouille une annonce de la file, puis la valide, la refuse, la challenge ou relâche
le verrou. Une annonce relâchée ou corrigée repasse dans la file de modération. Une annonce refusée
ne déclenche rien : c'est de la fraude.

```mermaid
flowchart LR
  classDef acteur fill:#fff176,stroke:#999,color:#000
  classDef vue fill:#aed581,stroke:#999,color:#000
  classDef commande fill:#4fc3f7,stroke:#999,color:#000
  classDef evenement fill:#ffb74d,stroke:#999,color:#000
  classDef agregat fill:#fbc02d,stroke:#999,color:#000
  classDef externe fill:#f48fb1,stroke:#999,color:#000
  classDef tache fill:#ffe0b2,stroke:#e65100,stroke-dasharray:5 3,color:#000
  classDef question fill:#bdbdbd,stroke:#999,color:#000

  subgraph MODERATION["Modération"]
    moderateur([Modérateur]):::acteur --> vueListe
    enFile[Annonce mise en file de modération]:::evenement --> vueListe
    vueListe["Vue liste d'annonces à modérer"]:::vue --> verrouiller[Verrouiller annonce]:::commande
    verrouiller --> verrouillee[Annonce verrouillée modé]:::evenement
    verrouillee --> vueModeration["Vue modération annonce (+ info compte)"]:::vue

    vueModeration --> valider[Valider annonce]:::commande --> validee[Annonce validée]:::evenement
    vueModeration --> refuser[Refuser annonce]:::commande --> refusee[Annonce refusée]:::evenement
    vueModeration --> challenger[Challenger annonce]:::commande --> challengee[Annonce challengée]:::evenement
    vueModeration --> relacher["Relâcher le verrou de l'annonce"]:::commande --> relache[Verrou annonce relâché]:::evenement

    verrouillee --> tVerrou[/"2 heures sans actions de modération passées depuis le verrou"/]:::tache
    tVerrou -.-> relacher
    relache -- "retour dans la file" --> vueListe
    refusee --> fin((fin))

    aFile[("File d'attente modération")]:::agregat
    aHistorique[("Historique d'annonce")]:::agregat
    aModerateur[(Modérateur)]:::agregat
    aKpi[(KPI modé)]:::agregat
    qAgregats{{"Deux agrégats ou un ? Date de lock / verrouillage"}}:::question
  end

  subgraph ANNONCE["Annonce"]
    vendeur([Vendeur]):::acteur --> vueEdition
    mailValidee[Mail annonce validée envoyé]:::evenement
    activee[Annonce activée]:::evenement
    mailChallengee[Mail annonce challengée envoyé]:::evenement
    mailChallengee --> vueEdition["Vue édition annonce (?)"]:::vue
    vueEdition --> corriger[Corriger annonce]:::commande
    corriger --> corrigee[Annonce corrigée]:::evenement
  end

  validee ==> activee
  validee ==> mailValidee
  challengee ==> mailChallengee
  corrigee == "retour dans la file" ==> vueListe
  mailValidee -.-> smtp[[SMTP]]:::externe
  mailChallengee -.-> smtp
```

### 3. Recherche, publicité et contact

La négociation, le rendez-vous et la transaction se passent entre l'acheteur et le vendeur, hors du
système. Une fois la transaction effectuée, le vendeur supprime son annonce (parcours 5). La
relance à 7 jours est une tâche programmée du sous-domaine Annonce : elle part si l'annonce n'a pas
été supprimée.

```mermaid
flowchart LR
  classDef acteur fill:#fff176,stroke:#999,color:#000
  classDef vue fill:#aed581,stroke:#999,color:#000
  classDef commande fill:#4fc3f7,stroke:#999,color:#000
  classDef evenement fill:#ffb74d,stroke:#999,color:#000
  classDef agregat fill:#fbc02d,stroke:#999,color:#000
  classDef externe fill:#f48fb1,stroke:#999,color:#000
  classDef tache fill:#ffe0b2,stroke:#e65100,stroke-dasharray:5 3,color:#000
  classDef question fill:#bdbdbd,stroke:#999,color:#000

  subgraph ANNONCE["Annonce"]
    acheteur([Acheteur]):::acteur --> accueil
    qAcheteur{{"?"}}:::question --- acheteur
    accueil["Page d'accueil"]:::vue --> recherche[Une recherche effectuée]:::evenement
    recherche --> vueResultats[Vue résultats recherche]:::vue
    vueResultats --> vueAnnonce[Vue annonce]:::vue
    vueAnnonce --> formulaireContact[Formulaire de contact]:::vue
    formulaireContact --> contacter[Contacter]:::commande
    contacter --> contactSoumis[Formulaire de contact soumis]:::evenement
    contactSoumis --> vueConfirmation[Vue confirmation de contact]:::vue
    contactSoumis --> mailContact[Email de contact envoyé]:::evenement
    contactSoumis --> tRelance[/"7 j après formulaire de contact soumis, sans suppression"/]:::tache
    tRelance -.-> mailRelance[Mail de relance vendeur envoyé]:::evenement
    supprimer["Supprimer annonce (parcours 5)"]:::commande
    aAnnonce[(Annonce)]:::agregat
  end

  subgraph PUBLICITE["Publicité"]
    regie([Régie pub]):::acteur --> pubAffichee
    pubAffichee["Pub affichée $$$"]:::evenement
    finDuMois[Fin du mois arrivée]:::evenement --> pubRemuneree[Pub rémunérée]:::evenement
  end

  subgraph MODERATION["Modération"]
    kpiIncremente[KPI modé incrémenté]:::evenement
    aKpi[(KPI modé)]:::agregat
  end

  subgraph HORS["Hors du système"]
    acheteurVendeur(["Acheteur / Vendeur"]):::acteur --> nego
    nego[Négo finalisée]:::evenement --> rdv[RDV fixé]:::evenement --> transaction[Transaction effectuée]:::evenement
  end

  accueil ==> pubAffichee
  vueResultats ==> pubAffichee
  vueAnnonce ==> pubAffichee
  contactSoumis ==> kpiIncremente
  mailContact --> nego
  transaction --> supprimer
  mailContact -.-> smtp[[SMTP]]:::externe
  pubAffichee -.-> adserver[[AD-Server]]:::externe
  pubRemuneree -.-> adserver
```

### 4. Signalement

Un re-signalement déclenche deux choses en parallèle : l'annonce est désactivée (Annonce) et elle
est remise en file de modération (Modération).

```mermaid
flowchart LR
  classDef acteur fill:#fff176,stroke:#999,color:#000
  classDef commande fill:#4fc3f7,stroke:#999,color:#000
  classDef evenement fill:#ffb74d,stroke:#999,color:#000

  subgraph MODERATION["Modération"]
    delateur([Délateur]):::acteur --> signaler
    signaler[Signaler annonce]:::commande --> signalee[Annonce signalée]:::evenement
    signalee --> resignalee[Annonce re-signalée]:::evenement
    resignalee --> enFile[Annonce mise en file de modération]:::evenement
  end

  subgraph ANNONCE["Annonce"]
    desactivee[Annonce désactivée]:::evenement
  end

  resignalee ==> desactivee
```

### 5. Suppression

Le vendeur supprime son annonce après une transaction effectuée (parcours 3).

```mermaid
flowchart LR
  classDef acteur fill:#fff176,stroke:#999,color:#000
  classDef vue fill:#aed581,stroke:#999,color:#000
  classDef commande fill:#4fc3f7,stroke:#999,color:#000
  classDef evenement fill:#ffb74d,stroke:#999,color:#000
  classDef agregat fill:#fbc02d,stroke:#999,color:#000
  classDef question fill:#bdbdbd,stroke:#999,color:#000

  subgraph HORS["Hors du système"]
    transaction[Transaction effectuée]:::evenement
  end

  subgraph ANNONCE["Annonce"]
    vendeur([Vendeur]):::acteur --> formulaire
    formulaire["Formulaire suppression (+ raison)"]:::vue --> supprimer[Supprimer annonce]:::commande
    supprimer --> supprimee[Annonce supprimée]:::evenement
    supprimee --> desactivee[Annonce désactivée]:::evenement
    qSupprimee{{"?"}}:::question --- supprimee
    aAnnonce[(Annonce)]:::agregat
  end

  transaction --> vendeur
```

### 6. Archivage

L'expiration : trois tâches programmées du sous-domaine Annonce, une même commande.

```mermaid
flowchart LR
  classDef commande fill:#4fc3f7,stroke:#999,color:#000
  classDef evenement fill:#ffb74d,stroke:#999,color:#000
  classDef tache fill:#ffe0b2,stroke:#e65100,stroke-dasharray:5 3,color:#000
  classDef agregat fill:#fbc02d,stroke:#999,color:#000

  subgraph ANNONCE["Annonce"]
    t1[/"60 j passés depuis refus modé"/]:::tache -.-> archiver
    t2[/"60 j passés depuis challenge modé"/]:::tache -.-> archiver
    t3[/"60 j passés après mise en ligne"/]:::tache -.-> archiver
    archiver[Archiver annonce]:::commande --> archivee[Annonce archivée]:::evenement
    aAnnonce[(Annonce)]:::agregat
  end

  subgraph MODERATION["Modération"]
    historiqueSupprime[Historique annonce supprimé]:::evenement
    aHistorique[("Historique d'annonce")]:::agregat
  end

  archivee ==> historiqueSupprime
```

Sur le troisième déclencheur, « dépôt » est barré et remplacé par « mise en ligne ». Sur les trois
post-its « Historique annonce supprimé », « archivé » est barré et remplacé par « supprimé ».

### Post-it isolé

- **Service client contacté** — événement posé seul en bas du mur, rattaché à aucun parcours.

## Agrégats

Ce que l'atelier a noté sur les post-its jaune foncé. C'est une réflexion en cours, pas un schéma.

| Sous-domaine | Agrégat                   | Contenu noté sur le mur |
| ------------ | ------------------------- | ----------------------- |
| Annonce      | Annonce                   | titre, description, prix, mail contact, pseudo, tel, date dépôt, région, dép, ville, CP, catégorie, ID (UUID), images / URL, status, `estActivée()`, expiration date |
| Modération   | File d'attente modération | rien de noté ; question « Deux agrégats ou un ? Date de lock / verrouillage » |
| Modération   | Historique d'annonce      | ID de l'annonce ; historique : date événement, type, auteur de l'annonce, modérateur |
| Modération   | Modérateur                | ID, email |
| Modération   | KPI modé                  | rien de noté |
| Publicité    | aucun sur le mur          |                         |

## Questions

Posées sur le mur (post-its gris) :

- **Deux agrégats ou un ? Date de lock / verrouillage** — sur File d'attente modération et
  Historique d'annonce.
- **« ? »** au-dessus de l'Acheteur (parcours 3) : question non notée.
- **« ? »** sous Annonce supprimée (parcours 5) : question non notée.

Relevées à la transcription :

1. **Validée et activée** — toute annonce validée est-elle activée, ou y a-t-il des cas où non ?
2. **Désactivée** — après un re-signalement (4) et après une suppression (5) : même état ?
3. **Re-signalée** — à partir de combien de signalements ?
4. **Mise en ligne** (6) — est-ce « Annonce activée » ?
5. **Relance à 7 jours** (3) — le post-it dit « form d'achat (?) soumis » : s'agit-il du formulaire
   de contact ?
6. **Délateur** — un acheteur, un visiteur, n'importe qui ?
7. **Service client contacté** — dans quel sous-domaine, déclenché par quoi ?

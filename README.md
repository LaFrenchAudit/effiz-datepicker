# @effiz/datepicker

Un composant **datepicker pour Vue 3** au style [Flowbite](https://flowbite.com/docs/plugins/datepicker/),
**sans dépendance à Flowbite**. Autonome, léger (~6 kB gzip JS + ~1,5 kB gzip CSS) et entièrement typé.

- 📘 **Documentation complète & démo interactive :** https://datepicker-doc.lafrenchexpert.fr/
- 🤖 **Docs pour machines / IA :**
  [`llms.txt`](https://datepicker-doc.lafrenchexpert.fr/llms.txt) ·
  [`llms-full.txt`](https://datepicker-doc.lafrenchexpert.fr/llms-full.txt) ·
  [`api.json`](https://datepicker-doc.lafrenchexpert.fr/api.json)

## Fonctionnalités

- 🎯 **Trois granularités** : une **date**, un **mois** seul, une **année** seule.
- 🔀 **Mode plage (range)** pour chacune des granularités.
- 🎨 **Couleur primaire personnalisable** (prop `primary-color` ou variable CSS `--effiz-dp-primary`).
- 🌗 **Thème clair / sombre**, 🌍 **localisation** `Intl`, ⌨️ **navigation clavier** + ARIA.
- 🧩 **Autonome** : styles encapsulés, **Tailwind non requis** côté projet consommateur.
- 🪟 **Top layer** (Popover API) : s'affiche correctement dans un `<dialog>` modal ou un conteneur `overflow:hidden`, sans être rogné ni masqué.
- 📦 TypeScript, `v-model`, bornes `min`/`max`, jours désactivés, affichage inline.

## Installation

```bash
npm install @effiz/datepicker
```

```ts
import { EffizDatepicker } from '@effiz/datepicker'
import '@effiz/datepicker/style.css'
```

## Démarrage rapide

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { EffizDatepicker } from '@effiz/datepicker'
import '@effiz/datepicker/style.css'

const date = ref<Date | null>(null)
</script>

<template>
  <EffizDatepicker v-model="date" locale="fr-FR" placeholder="Choisir une date" />
</template>
```

## Les modes en un coup d'œil

```vue
<!-- Granularité : date (défaut), mois ou année -->
<EffizDatepicker v-model="date" type="date" />
<EffizDatepicker v-model="mois" type="month" />
<EffizDatepicker v-model="annee" type="year" />

<!-- Plage : ajoutez `range`, le v-model devient [début, fin] -->
<EffizDatepicker v-model="plage" type="date" range />

<!-- Couleur primaire (n'importe quelle couleur CSS) -->
<EffizDatepicker v-model="date" primary-color="#7c3aed" />

<!-- Calendrier inline, sans champ ni popover -->
<EffizDatepicker v-model="date" inline />
```

> La valeur émise est toujours un objet `Date` (ou `[Date | null, Date | null]` en mode `range`).
> En `type="month"`/`"year"`, elle est normalisée au 1er du mois / 1er janvier.

## API (résumé)

Props principales : `modelValue`, `type` (`date` \| `month` \| `year`), `range`, `min`, `max`,
`disabledDate`, `locale`, `firstDayOfWeek`, `primaryColor`, `dark`, `inline`, `format`,
`placeholder`, `disabled`, `clearable`, `closeOnSelect`…

Événements : `update:modelValue`, `change`, `open`, `close`, `clear`.

Thème : surchargez les variables CSS sur `.effiz-dp` (`--effiz-dp-primary`, `--effiz-dp-surface`,
`--effiz-dp-border`, `--effiz-dp-radius`…). Mode sombre via la prop `dark` ou une classe `.dark`
sur un ancêtre.

👉 **Référence exhaustive** (toutes les props avec types et défauts, événements, méthodes, types
TypeScript, variables CSS, raccourcis clavier et recettes) :
la [documentation en ligne](https://datepicker-doc.lafrenchexpert.fr/) ou, pour les outils
et agents, [`api.json`](https://datepicker-doc.lafrenchexpert.fr/api.json) /
[`llms-full.txt`](https://datepicker-doc.lafrenchexpert.fr/llms-full.txt).

## Développement

```bash
npm install
npm run dev          # documentation + démo interactive
npm run build        # build de la librairie (dist/)
npm run build:demo   # build du site de docs (dist-demo/) — servi par Docker/nginx
npm run test         # tests unitaires (Vitest, ~94 % de couverture)
npm run type-check   # vérification TypeScript
```

Le site de docs et les fichiers `api.json` / `llms*.txt` sont générés depuis une **source unique
de vérité** (`src/demo/api-spec.js`) par `scripts/gen-docs.mjs`, donc toujours synchronisés avec
le composant.

## Déploiement (Docker + Watchtower)

Le site de docs est packagé en image Docker (build Vite → nginx) et hébergé sur notre serveur
(Portainer + cloudflared), pas sur GitHub Pages.

- `.github/workflows/ci.yml` — type-check, tests et build à chaque push / PR.
- `.github/workflows/docker-publish.yml` — à chaque **release GitHub**, construit l'image et la
  pousse sur **GHCR** taguée avec la version de la release + `latest`
  (`ghcr.io/lafrenchaudit/effiz-datepicker-doc`).
- `docker-compose.yml` — à déployer sur le serveur : le conteneur nginx + **Watchtower**, qui
  surveille le tag `:latest` et recrée le conteneur automatiquement à chaque nouvelle image.

Publier une nouvelle version du site = créer une release GitHub (ou lancer le workflow
manuellement). Une **pré-release** ne met pas à jour `:latest` (donc pas de déploiement auto).

Sur le serveur :

```bash
docker compose up -d
```

Puis router `datepicker-doc.lafrenchexpert.fr` vers le conteneur via cloudflared (port `8080`
publié par défaut, ou réseau Docker partagé — voir les commentaires du `docker-compose.yml`).

> Image GHCR : rends le package **public** (Packages → Package settings → Change visibility) pour
> un pull anonyme par Watchtower, ou monte un `config.json` avec un token de pull (voir le compose).

## Publication de la librairie (npm)

La librairie est publiée sur **npmjs.com** sous `@effiz/datepicker`, à chaque **release GitHub**,
par `.github/workflows/npm-publish.yml`. L'authentification se fait par **Trusted Publishing
(OIDC)** : GitHub s'authentifie directement auprès de npm, **sans token ni secret à stocker**. Le
workflow aligne la version sur le tag (sans le `v`), reconstruit `dist/` (`prepublishOnly`) puis
`npm publish`.

Amorçage (une seule fois — l'OIDC ne peut pas créer un package qui n'existe pas encore) :

1. **Activer la 2FA** sur le compte npm (npm l'impose pour publier).
2. **Premier publish manuel** pour créer le package :
   ```bash
   npm login          # avec 2FA
   npm ci
   npm publish        # saisir l'OTP ; crée @effiz/datepicker (public)
   ```
3. Sur npmjs.com : `@effiz/datepicker → Settings → Trusted Publisher → GitHub Actions`, avec le
   dépôt `LaFrenchAudit/effiz-datepicker` et le workflow `npm-publish.yml`.

Ensuite, publier une version = créer une **release GitHub** (tag `> 0.1.0`, la version amorcée). La
CI publie alors via OIDC, sans secret. La même release déclenche aussi l'image de doc.

Côté projet consommateur, rien de spécial (package public) :

```bash
npm install @effiz/datepicker
```

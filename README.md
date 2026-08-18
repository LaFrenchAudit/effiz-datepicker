# @effiz/datepicker

Un composant **datepicker pour Vue 3** au style [Flowbite](https://flowbite.com/docs/plugins/datepicker/),
**sans dépendance à Flowbite**. Autonome, léger (~6 kB gzip JS + ~1,5 kB gzip CSS) et entièrement typé.

- 📘 **Documentation complète & démo interactive :** https://lafrenchaudit.github.io/effiz-datepicker/
- 🤖 **Docs pour machines / IA :**
  [`llms.txt`](https://lafrenchaudit.github.io/effiz-datepicker/llms.txt) ·
  [`llms-full.txt`](https://lafrenchaudit.github.io/effiz-datepicker/llms-full.txt) ·
  [`api.json`](https://lafrenchaudit.github.io/effiz-datepicker/api.json)

## Fonctionnalités

- 🎯 **Trois granularités** : une **date**, un **mois** seul, une **année** seule.
- 🔀 **Mode plage (range)** pour chacune des granularités.
- 🎨 **Couleur primaire personnalisable** (prop `primary-color` ou variable CSS `--effiz-dp-primary`).
- 🌗 **Thème clair / sombre**, 🌍 **localisation** `Intl`, ⌨️ **navigation clavier** + ARIA.
- 🧩 **Autonome** : styles encapsulés, **Tailwind non requis** côté projet consommateur.
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
la [documentation en ligne](https://lafrenchaudit.github.io/effiz-datepicker/) ou, pour les outils
et agents, [`api.json`](https://lafrenchaudit.github.io/effiz-datepicker/api.json) /
[`llms-full.txt`](https://lafrenchaudit.github.io/effiz-datepicker/llms-full.txt).

## Développement

```bash
npm install
npm run dev          # documentation + démo interactive
npm run build        # build de la librairie (dist/)
npm run build:demo   # build du site de docs (dist-demo/) — déployé sur Pages
npm run test         # tests unitaires (Vitest, ~94 % de couverture)
npm run type-check   # vérification TypeScript
```

Le site de docs et les fichiers `api.json` / `llms*.txt` sont générés depuis une **source unique
de vérité** (`src/demo/api-spec.js`) par `scripts/gen-docs.mjs`, donc toujours synchronisés avec
le composant.

CI/CD : `.github/workflows/ci.yml` (type-check, tests, build) et `deploy-pages.yml` (publication
de la démo sur GitHub Pages au merge sur `main`, ou via l'onglet Actions). Pré-requis Pages :
_Settings → Pages → Source = GitHub Actions_.

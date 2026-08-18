# @effiz/datepicker

Un composant **datepicker pour Vue 3** au style [Flowbite](https://flowbite.com/docs/plugins/datepicker/),
**sans dépendance à Flowbite**. Pensé pour être réutilisé dans les différents projets de
l'entreprise, il est autonome, léger (~6 kB gzip JS + ~1,5 kB gzip CSS) et entièrement typé.

👉 **Démo en ligne :** https://lafrenchaudit.github.io/effiz-datepicker/

## Fonctionnalités

- 🎯 **Quatre granularités** de sélection : une **date**, un **mois** seul, une **année** seule.
- 🔀 **Mode plage (range)** disponible pour chacune des granularités (plage de dates, de mois, d'années).
- 🎨 **Couleur de teinte primaire personnalisable** (prop `primary-color` ou variable CSS).
- 🌗 **Thème clair / sombre** intégré.
- 🌍 **Localisation** via l'API `Intl` (français par défaut, semaine débutant le lundi).
- ⌨️ **Navigation clavier** (flèches, `PageUp`/`PageDown`, `Entrée`, `Échap`) et attributs ARIA.
- 🧩 **Autonome** : styles encapsulés, **Tailwind non requis** côté projet consommateur.
- 📦 TypeScript, `v-model`, bornes `min`/`max`, jours désactivés, affichage inline.

> Tailwind reste une dépendance **acceptée mais optionnelle** : elle n'est utilisée que par la
> démo. Le composant, lui, embarque son propre CSS.

## Installation

```bash
npm install @effiz/datepicker
```

Importez le composant **et** sa feuille de style une fois dans votre application :

```ts
import { EffizDatepicker } from '@effiz/datepicker'
import '@effiz/datepicker/style.css'
```

Ou enregistrez les composants globalement via le plugin :

```ts
import { createApp } from 'vue'
import { EffizDatepickerPlugin } from '@effiz/datepicker'
import '@effiz/datepicker/style.css'
import App from './App.vue'

createApp(App).use(EffizDatepickerPlugin).mount('#app')
```

## Utilisation

### Date simple

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

### Mois seul / année seule

```vue
<EffizDatepicker v-model="mois" type="month" />
<EffizDatepicker v-model="annee" type="year" />
```

### Plages (range)

Ajoutez simplement l'attribut `range`. Le `v-model` devient alors un tuple `[Date | null, Date | null]`.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { EffizDatepicker, type RangeValue } from '@effiz/datepicker'

const plageDates = ref<RangeValue>([null, null])
const plageMois = ref<RangeValue>([null, null])
const plageAnnees = ref<RangeValue>([null, null])
</script>

<template>
  <EffizDatepicker v-model="plageDates" type="date" range />
  <EffizDatepicker v-model="plageMois" type="month" range />
  <EffizDatepicker v-model="plageAnnees" type="year" range />
</template>
```

### Couleur primaire

Par instance, avec n'importe quelle couleur CSS :

```vue
<EffizDatepicker v-model="date" primary-color="#7c3aed" />
```

Globalement, en surchargeant la variable CSS (par exemple pour la brancher sur le thème Tailwind) :

```css
.effiz-dp {
  --effiz-dp-primary: #16a34a;
}
```

### Affichage inline (sans champ)

```vue
<EffizDatepicker v-model="date" inline />
```

## Props

| Prop             | Type                                             | Défaut          | Description                                                             |
| ---------------- | ------------------------------------------------ | --------------- | ---------------------------------------------------------------------- |
| `modelValue`     | `Date \| null \| [Date\|null, Date\|null]`       | `null`          | Valeur liée (`v-model`).                                               |
| `type`           | `'date' \| 'month' \| 'year'`                    | `'date'`        | Granularité de la sélection.                                          |
| `range`          | `boolean`                                         | `false`         | Active la sélection d'une plage.                                       |
| `min`            | `Date \| string \| number`                       | —               | Date minimale sélectionnable.                                         |
| `max`            | `Date \| string \| number`                       | —               | Date maximale sélectionnable.                                         |
| `disabledDate`   | `(date: Date, type) => boolean`                  | —               | Prédicat pour désactiver certaines unités.                           |
| `locale`         | `string`                                         | locale système | Locale `Intl` (ex. `'fr-FR'`).                                         |
| `firstDayOfWeek` | `number`                                         | `1` (lundi)     | Premier jour de la semaine (0 = dimanche).                            |
| `monthFormat`    | `'short' \| 'long'`                              | `'short'`       | Format des libellés de mois.                                          |
| `weekdayFormat`  | `'short' \| 'narrow' \| 'long'`                  | `'short'`       | Format des en-têtes de jours.                                        |
| `inline`         | `boolean`                                         | `false`         | Affiche le calendrier sans champ ni popover.                          |
| `showFooter`     | `boolean`                                         | `true`          | Affiche la barre de boutons.                                          |
| `showToday`      | `boolean`                                         | `true`          | Affiche le bouton « Aujourd'hui ».                                    |
| `showClear`      | `boolean`                                         | `true`          | Affiche le bouton « Effacer ».                                        |
| `todayLabel`     | `string`                                         | `"Aujourd'hui"` | Libellé du bouton aujourd'hui.                                        |
| `clearLabel`     | `string`                                         | `'Effacer'`     | Libellé du bouton effacer.                                            |
| `placeholder`    | `string`                                         | `''`            | Placeholder du champ.                                                  |
| `disabled`       | `boolean`                                         | `false`         | Désactive le composant.                                               |
| `clearable`      | `boolean`                                         | `true`          | Affiche une croix pour vider la valeur.                               |
| `format`         | `(date: Date, type) => string`                   | format `Intl`   | Formateur d'affichage personnalisé.                                  |
| `separator`      | `string`                                         | `' – '`         | Séparateur entre les deux dates d'une plage.                          |
| `closeOnSelect`  | `boolean`                                         | `true`          | Ferme le popover après une sélection (complète).                     |
| `primaryColor`   | `string`                                         | `#1a56db`       | Couleur de teinte primaire de l'instance.                            |
| `dark`           | `boolean`                                         | `false`         | Force le thème sombre.                                                |
| `id` / `name`    | `string`                                         | —               | Attributs du champ (formulaires).                                    |
| `inputClass`     | `string`                                         | —               | Classe additionnelle sur le champ.                                   |

## Événements

| Événement            | Payload            | Description                                     |
| -------------------- | ------------------ | ----------------------------------------------- |
| `update:modelValue`  | valeur             | Émis à chaque changement (`v-model`).           |
| `change`             | valeur             | Idem, sémantique « changement ».                |
| `open` / `close`     | —                  | Ouverture / fermeture du popover.               |
| `clear`              | —                  | La valeur a été vidée via la croix.             |

## Thème (variables CSS)

Toutes surchargables sur `.effiz-dp` :

| Variable                       | Rôle                                    |
| ------------------------------ | --------------------------------------- |
| `--effiz-dp-primary`           | Couleur primaire (sélection, boutons).  |
| `--effiz-dp-primary-contrast`  | Couleur du texte sur fond primaire.     |
| `--effiz-dp-surface`           | Fond des panneaux et du champ.          |
| `--effiz-dp-border`            | Bordures.                               |
| `--effiz-dp-text`              | Couleur de texte principale.            |
| `--effiz-dp-text-muted`        | Texte secondaire (jours de la semaine). |
| `--effiz-dp-radius`            | Rayon des coins.                        |

Le mode sombre s'active soit via la prop `dark`, soit en ajoutant la classe `.dark` sur un
ancêtre (convention Tailwind).

## Développement

```bash
npm install
npm run dev          # démo interactive (toutes les variantes)
npm run build        # build de la librairie (dist/)
npm run build:demo   # build de la démo (dist-demo/) — déployée sur Pages
npm run type-check   # vérification TypeScript
npm run test         # tests unitaires (Vitest)
npm run coverage     # tests + rapport de couverture
```

### Tests

Le composant est couvert par **Vitest** + **@vue/test-utils** (67 tests) :
utilitaires de dates (100 %), sélection date/mois/année, plages, navigation,
bornes `min`/`max`, jours désactivés, clavier, popover, thème. Couverture ≈ 94 %.

### Intégration continue & déploiement

- `.github/workflows/ci.yml` — type-check, tests et build à chaque push / PR.
- `.github/workflows/deploy-pages.yml` — construit la démo et la publie sur
  **GitHub Pages** à chaque merge sur `main` (ou manuellement via l'onglet
  Actions). Pré-requis : dans les réglages du dépôt, _Settings → Pages →
  Source = GitHub Actions_.

## Licence

MIT — La French Audit.

/**
 * Single source of truth for the Effiz Datepicker public API.
 *
 * This file is consumed both by the documentation site (src/demo/App.vue) to
 * render the reference tables AND by scripts/gen-docs.mjs to emit the
 * machine-readable artifacts (api.json, llms.txt, llms-full.txt). Keeping one
 * source guarantees the human docs and the AI/machine docs never drift apart.
 *
 * Plain JS (with JSDoc) on purpose, so Node can import it without a TS loader.
 */

export const meta = {
  name: '@effiz/datepicker',
  version: '0.1.0',
  title: 'Effiz Datepicker',
  description:
    'Composant datepicker Vue 3 au style Flowbite, sans dépendance à Flowbite. Sélection de date, de mois ou d’année — chacune disponible aussi en plage (range). Couleur primaire personnalisable, thème clair/sombre, localisation Intl, navigation clavier et styles encapsulés (Tailwind non requis côté projet).',
  repository: 'https://github.com/LaFrenchAudit/effiz-datepicker',
  demo: 'https://datepicker-doc.lafrenchexpert.fr/',
  license: 'MIT',
  framework: 'Vue 3 (>=3.3)',
  peerDependencies: { vue: '^3.3.0' },
  install: 'npm install @effiz/datepicker',
  components: ['EffizDatepicker', 'EffizCalendar'],
  cssImport: "import '@effiz/datepicker/style.css'",
  bundleSize: '~6 kB gzip JS + ~1,5 kB gzip CSS',
}

/**
 * Public props. Shared by both components unless `component` narrows it.
 * `component: 'EffizDatepicker'` marks props that only exist on the input wrapper.
 */
export const props = [
  {
    name: 'modelValue',
    type: 'Date | null | [Date | null, Date | null]',
    default: 'null',
    required: false,
    description:
      'Valeur liée via v-model. En mode simple : un Date ou null. En mode range : un tuple [début, fin]. Accepte aussi en entrée une chaîne ISO ou un timestamp (converti en Date). La valeur émise est toujours un objet Date.',
  },
  {
    name: 'type',
    type: "'date' | 'month' | 'year'",
    default: "'date'",
    required: false,
    values: ['date', 'month', 'year'],
    description:
      'Granularité de la sélection. "date" = un jour ; "month" = un mois entier (normalisé au 1er du mois) ; "year" = une année entière (normalisée au 1er janvier).',
  },
  {
    name: 'range',
    type: 'boolean',
    default: 'false',
    required: false,
    description:
      'Active la sélection d’une plage. Le v-model devient alors un tuple [début, fin]. Fonctionne avec les trois valeurs de `type`.',
  },
  {
    name: 'min',
    type: 'Date | string | number',
    default: 'undefined',
    required: false,
    description: 'Borne minimale sélectionnable (incluse), comparée à la granularité de `type`.',
  },
  {
    name: 'max',
    type: 'Date | string | number',
    default: 'undefined',
    required: false,
    description: 'Borne maximale sélectionnable (incluse), comparée à la granularité de `type`.',
  },
  {
    name: 'disabledDate',
    type: '(date: Date, type: DatepickerType) => boolean',
    default: 'undefined',
    required: false,
    description:
      'Prédicat renvoyant true pour rendre une unité non sélectionnable. Reçoit la date normalisée et le type courant. Exemple : désactiver les week-ends.',
  },
  {
    name: 'locale',
    type: 'string',
    default: 'locale système',
    required: false,
    description:
      'Locale BCP 47 passée à l’API Intl pour les libellés (jours, mois, formatage). Ex. "fr-FR", "en-US".',
  },
  {
    name: 'firstDayOfWeek',
    type: 'number',
    default: '1',
    required: false,
    values: ['0', '1', '2', '3', '4', '5', '6'],
    description: 'Premier jour de la semaine. 0 = dimanche, 1 = lundi (défaut), … 6 = samedi.',
  },
  {
    name: 'monthFormat',
    type: "'short' | 'long'",
    default: "'short'",
    required: false,
    values: ['short', 'long'],
    description: 'Format des libellés de mois dans la grille des mois.',
  },
  {
    name: 'weekdayFormat',
    type: "'short' | 'narrow' | 'long'",
    default: "'short'",
    required: false,
    values: ['short', 'narrow', 'long'],
    description: 'Format des en-têtes de jours de la semaine.',
  },
  {
    name: 'inline',
    type: 'boolean',
    default: 'false',
    required: false,
    description: 'Affiche le calendrier directement, sans champ texte ni popover.',
  },
  {
    name: 'showFooter',
    type: 'boolean',
    default: 'true',
    required: false,
    description: 'Affiche la barre de boutons en bas du calendrier.',
  },
  {
    name: 'showToday',
    type: 'boolean',
    default: 'true',
    required: false,
    description: 'Affiche le bouton « Aujourd’hui ».',
  },
  {
    name: 'showClear',
    type: 'boolean',
    default: 'true',
    required: false,
    description: 'Affiche le bouton « Effacer » dans la barre de boutons.',
  },
  {
    name: 'todayLabel',
    type: 'string',
    default: "\"Aujourd'hui\"",
    required: false,
    description: 'Libellé du bouton aujourd’hui.',
  },
  {
    name: 'clearLabel',
    type: 'string',
    default: "'Effacer'",
    required: false,
    description: 'Libellé du bouton effacer.',
  },
  {
    name: 'placeholder',
    type: 'string',
    default: "''",
    required: false,
    component: 'EffizDatepicker',
    description: 'Texte indicatif du champ quand aucune valeur n’est sélectionnée.',
  },
  {
    name: 'disabled',
    type: 'boolean',
    default: 'false',
    required: false,
    component: 'EffizDatepicker',
    description: 'Désactive le champ et empêche l’ouverture du popover.',
  },
  {
    name: 'clearable',
    type: 'boolean',
    default: 'true',
    required: false,
    component: 'EffizDatepicker',
    description: 'Affiche une croix pour vider la valeur quand une valeur est présente.',
  },
  {
    name: 'format',
    type: '(date: Date, type: DatepickerType) => string',
    default: 'format Intl',
    required: false,
    component: 'EffizDatepicker',
    description:
      'Formateur d’affichage personnalisé, appliqué à chaque date. Par défaut, formatage localisé via Intl.',
  },
  {
    name: 'separator',
    type: 'string',
    default: "' – '",
    required: false,
    component: 'EffizDatepicker',
    description: 'Séparateur affiché entre les deux dates d’une plage dans le champ.',
  },
  {
    name: 'closeOnSelect',
    type: 'boolean',
    default: 'true',
    required: false,
    component: 'EffizDatepicker',
    description:
      'Ferme le popover après une sélection complète (une date en mode simple, les deux bornes en mode range).',
  },
  {
    name: 'primaryColor',
    type: 'string',
    default: '#1a56db',
    required: false,
    description:
      'Couleur de teinte primaire de l’instance (n’importe quelle couleur CSS). Alimente la variable --effiz-dp-primary ; toutes les teintes dérivées (survol, bande de plage) en découlent.',
  },
  {
    name: 'dark',
    type: 'boolean',
    default: 'false',
    required: false,
    description:
      'Force le thème sombre. Sans cette prop, le thème sombre s’active aussi via une classe .dark sur un ancêtre (convention Tailwind).',
  },
  {
    name: 'id',
    type: 'string',
    default: 'undefined',
    required: false,
    component: 'EffizDatepicker',
    description: 'Attribut id du champ (utile pour lier un <label>).',
  },
  {
    name: 'name',
    type: 'string',
    default: 'undefined',
    required: false,
    component: 'EffizDatepicker',
    description: 'Attribut name du champ (formulaires).',
  },
  {
    name: 'inputClass',
    type: 'string',
    default: 'undefined',
    required: false,
    component: 'EffizDatepicker',
    description: 'Classe CSS additionnelle appliquée au champ.',
  },
]

export const events = [
  {
    name: 'update:modelValue',
    payload: 'Date | null | [Date | null, Date | null]',
    description: 'Émis à chaque changement de valeur (utilisé par v-model).',
  },
  {
    name: 'change',
    payload: 'Date | null | [Date | null, Date | null]',
    description: 'Émis en même temps que update:modelValue, sémantique « changement ».',
  },
  {
    name: 'open',
    payload: '—',
    description: 'Popover ouvert. (EffizDatepicker uniquement.)',
  },
  {
    name: 'close',
    payload: '—',
    description: 'Popover fermé. (EffizDatepicker uniquement.)',
  },
  {
    name: 'clear',
    payload: '—',
    description: 'La valeur a été vidée via la croix du champ. (EffizDatepicker uniquement.)',
  },
  {
    name: 'select',
    payload: 'Date',
    description: 'Une valeur simple a été sélectionnée. (EffizCalendar — bas niveau.)',
  },
  {
    name: 'range-complete',
    payload: '[Date, Date]',
    description: 'Les deux bornes d’une plage ont été sélectionnées. (EffizCalendar — bas niveau.)',
  },
]

export const methods = [
  {
    name: 'open()',
    signature: '() => void',
    description: 'Ouvre le popover par programmation. (EffizDatepicker, via template ref.)',
  },
  {
    name: 'close()',
    signature: '() => void',
    description: 'Ferme le popover. (EffizDatepicker, via template ref.)',
  },
  {
    name: 'toggle()',
    signature: '() => void',
    description: 'Bascule l’ouverture du popover. (EffizDatepicker, via template ref.)',
  },
]

export const cssVars = [
  { name: '--effiz-dp-primary', default: '#1a56db', description: 'Couleur primaire (sélection, boutons, focus).' },
  { name: '--effiz-dp-primary-contrast', default: '#ffffff', description: 'Couleur du texte sur fond primaire.' },
  { name: '--effiz-dp-primary-hover', default: 'color-mix(primary, #000 12%)', description: 'Teinte primaire au survol.' },
  { name: '--effiz-dp-range-bg', default: 'color-mix(primary, transparent 86%)', description: 'Fond de la bande de plage (jours intermédiaires).' },
  { name: '--effiz-dp-surface', default: '#ffffff', description: 'Fond des panneaux et du champ.' },
  { name: '--effiz-dp-border', default: '#e5e7eb', description: 'Couleur des bordures.' },
  { name: '--effiz-dp-text', default: '#111827', description: 'Couleur de texte principale.' },
  { name: '--effiz-dp-text-muted', default: '#6b7280', description: 'Texte secondaire (jours de la semaine).' },
  { name: '--effiz-dp-text-faded', default: '#9ca3af', description: 'Texte atténué (jours hors mois, icônes).' },
  { name: '--effiz-dp-hover', default: '#f3f4f6', description: 'Fond au survol des cellules neutres.' },
  { name: '--effiz-dp-shadow', default: 'ombre portée', description: 'Ombre du panneau en popover.' },
  { name: '--effiz-dp-radius', default: '0.5rem', description: 'Rayon des coins.' },
  { name: '--effiz-dp-focus-ring', default: 'color-mix(primary, transparent 55%)', description: 'Halo de focus du champ.' },
]

export const types = [
  { name: 'DatepickerType', definition: "'date' | 'month' | 'year'", description: 'Granularité de sélection.' },
  { name: 'DateInput', definition: 'Date | string | number | null | undefined', description: 'Valeurs acceptées en entrée pour une date.' },
  { name: 'SingleValue', definition: 'Date | null', description: 'Valeur émise en mode simple.' },
  { name: 'RangeValue', definition: '[Date | null, Date | null]', description: 'Valeur émise en mode range : [début, fin].' },
  { name: 'DatepickerModel', definition: 'SingleValue | RangeValue', description: 'Union des deux formes de v-model.' },
  { name: 'DisabledDateFn', definition: '(date: Date, type: DatepickerType) => boolean', description: 'Prédicat de désactivation.' },
  { name: 'CalendarView', definition: "'days' | 'months' | 'years'", description: 'Vue interne du calendrier (bas niveau).' },
]

export const keyboard = [
  { keys: 'Entrée / Espace / ↓', context: 'champ fermé', action: 'Ouvre le popover.' },
  { keys: 'Échap', context: 'popover ouvert', action: 'Ferme le popover et rend le focus au champ.' },
  { keys: '← →', context: 'grille', action: 'Déplace le focus d’une unité (jour / mois / année).' },
  { keys: '↑ ↓', context: 'grille', action: 'Déplace le focus d’une rangée (7 jours, ou 3 mois/années).' },
  { keys: 'Page↑ / Page↓', context: 'grille', action: 'Recule / avance d’un mois (jours), d’un an (mois) ou d’une décennie (années).' },
  { keys: 'Entrée / Espace', context: 'grille', action: 'Sélectionne l’unité focalisée (ou descend d’un niveau de vue).' },
]

/** Runnable, copy-pasteable examples. `lang` hints the code fence language. */
export const examples = [
  {
    id: 'install',
    title: 'Installation',
    lang: 'bash',
    description: 'Vue 3 (>= 3.3) est une peerDependency.',
    code: 'npm install @effiz/datepicker',
  },
  {
    id: 'quickstart',
    title: 'Démarrage rapide',
    lang: 'vue',
    description: 'Importez le composant et la feuille de style une fois.',
    code: `<script setup lang="ts">
import { ref } from 'vue'
import { EffizDatepicker } from '@effiz/datepicker'
import '@effiz/datepicker/style.css'

const date = ref<Date | null>(null)
</script>

<template>
  <EffizDatepicker v-model="date" locale="fr-FR" placeholder="Choisir une date" />
</template>`,
  },
  {
    id: 'plugin',
    title: 'Enregistrement global (plugin)',
    lang: 'ts',
    description: 'Enregistre <EffizDatepicker> et <EffizCalendar> globalement.',
    code: `import { createApp } from 'vue'
import { EffizDatepickerPlugin } from '@effiz/datepicker'
import '@effiz/datepicker/style.css'
import App from './App.vue'

createApp(App).use(EffizDatepickerPlugin).mount('#app')`,
  },
  {
    id: 'month',
    title: 'Mois seul',
    lang: 'vue',
    description: 'La valeur émise est le 1er du mois sélectionné.',
    code: `<EffizDatepicker v-model="mois" type="month" locale="fr-FR" />`,
  },
  {
    id: 'year',
    title: 'Année seule',
    lang: 'vue',
    description: 'La valeur émise est le 1er janvier de l’année sélectionnée.',
    code: `<EffizDatepicker v-model="annee" type="year" />`,
  },
  {
    id: 'range',
    title: 'Plage (date, mois ou année)',
    lang: 'vue',
    description: 'Ajoutez `range` ; le v-model devient [début, fin].',
    code: `<script setup lang="ts">
import { ref } from 'vue'
import { EffizDatepicker, type RangeValue } from '@effiz/datepicker'

const plage = ref<RangeValue>([null, null])
</script>

<template>
  <EffizDatepicker v-model="plage" type="date" range />
  <EffizDatepicker v-model="plage" type="month" range />
  <EffizDatepicker v-model="plage" type="year" range />
</template>`,
  },
  {
    id: 'color',
    title: 'Couleur primaire',
    lang: 'vue',
    description: 'Par instance via la prop, ou globalement via la variable CSS.',
    code: `<!-- par instance -->
<EffizDatepicker v-model="date" primary-color="#7c3aed" />

<!-- globalement -->
<style>
.effiz-dp { --effiz-dp-primary: #16a34a; }
</style>`,
  },
  {
    id: 'dark',
    title: 'Thème sombre',
    lang: 'vue',
    description: 'Via la prop `dark`, ou une classe `.dark` sur un ancêtre.',
    code: `<EffizDatepicker v-model="date" dark />`,
  },
  {
    id: 'constraints',
    title: 'Bornes et jours désactivés',
    lang: 'vue',
    description: 'Restreindre à l’année en cours, sans week-ends.',
    code: `<script setup lang="ts">
import { ref } from 'vue'
import { EffizDatepicker } from '@effiz/datepicker'

const date = ref<Date | null>(null)
const min = new Date(new Date().getFullYear(), 0, 1)
const max = new Date(new Date().getFullYear(), 11, 31)
const noWeekends = (d: Date) => d.getDay() === 0 || d.getDay() === 6
</script>

<template>
  <EffizDatepicker v-model="date" :min="min" :max="max" :disabled-date="noWeekends" />
</template>`,
  },
  {
    id: 'inline',
    title: 'Affichage inline',
    lang: 'vue',
    description: 'Sans champ ni popover.',
    code: `<EffizDatepicker v-model="date" inline />`,
  },
  {
    id: 'custom-format',
    title: 'Format d’affichage personnalisé',
    lang: 'vue',
    description: 'Contrôlez le texte affiché dans le champ.',
    code: `<EffizDatepicker
  v-model="date"
  :format="(d) => d.toLocaleDateString('fr-FR', { dateStyle: 'full' })"
/>`,
  },
  {
    id: 'methods',
    title: 'Contrôle par programmation',
    lang: 'vue',
    description: 'Ouvrir/fermer via une ref de template.',
    code: `<script setup lang="ts">
import { ref } from 'vue'
import { EffizDatepicker } from '@effiz/datepicker'

const picker = ref<InstanceType<typeof EffizDatepicker>>()
</script>

<template>
  <EffizDatepicker ref="picker" v-model="date" />
  <button @click="picker?.open()">Ouvrir</button>
</template>`,
  },
]

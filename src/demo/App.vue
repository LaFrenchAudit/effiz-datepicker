<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { EffizDatepicker, type DatepickerModel, type RangeValue } from '../index'
import CodeBlock from './CodeBlock.vue'
import EffizLogo from './EffizLogo.vue'
// Single source of truth — also emitted as api.json / llms*.txt (see scripts/gen-docs.mjs).
import { cssVars, events, examples, keyboard, meta, methods, props, types } from './api-spec.js'

/* ----------------------------------------------------------- Live demo state */

const singleDate = ref<Date | null>(null)
const singleMonth = ref<Date | null>(null)
const singleYear = ref<Date | null>(null)
const dateRange = ref<RangeValue>([null, null])
const monthRange = ref<RangeValue>([null, null])
const yearRange = ref<RangeValue>([null, null])
const inlineDate = ref<Date | null>(new Date())
const constrainedDate = ref<Date | null>(null)

const primaryColor = ref('#1a56db')
const dark = ref(false)
const presetColors = ['#1a56db', '#16a34a', '#db2777', '#ea580c', '#7c3aed', '#0891b2']

const now = new Date()
const minDate = new Date(now.getFullYear(), 0, 1)
const maxDate = new Date(now.getFullYear(), 11, 31)
const noWeekends = (d: Date) => d.getDay() === 0 || d.getDay() === 6

function fmt(value: DatepickerModel): string {
  if (Array.isArray(value)) {
    return value.map((d) => (d ? d.toLocaleDateString('fr-FR') : '—')).join(' → ')
  }
  return value ? value.toLocaleDateString('fr-FR') : '—'
}

function toggleDark() {
  dark.value = !dark.value
  document.documentElement.classList.toggle('dark', dark.value)
}

/* --------------------------------------------------------------- Navigation */

const sections = [
  { id: 'apercu', label: 'Aperçu' },
  { id: 'installation', label: 'Installation' },
  { id: 'exemples', label: 'Exemples en direct' },
  { id: 'props', label: 'Props' },
  { id: 'evenements', label: 'Événements' },
  { id: 'methodes', label: 'Méthodes' },
  { id: 'types', label: 'Types' },
  { id: 'theme', label: 'Thème (CSS)' },
  { id: 'clavier', label: 'Clavier' },
  { id: 'recettes', label: 'Recettes' },
  { id: 'ia', label: 'Pour les IA' },
]

// Scroll-spy: highlight the section currently in view in the side panel.
const activeSection = ref(sections[0].id)
let observer: IntersectionObserver | undefined

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) activeSection.value = entry.target.id
      }
    },
    { rootMargin: '-45% 0px -50% 0px', threshold: 0 },
  )
  for (const s of sections) {
    const el = document.getElementById(s.id)
    if (el) observer.observe(el)
  }
})

onBeforeUnmount(() => observer?.disconnect())

const wrapperProps = computed(() => props.filter((p) => !p.component))
const inputProps = computed(() => props.filter((p) => p.component === 'EffizDatepicker'))

const quickStart = examples.find((e) => e.id === 'quickstart')!
const installExample = examples.find((e) => e.id === 'install')!
const pluginExample = examples.find((e) => e.id === 'plugin')!
</script>

<template>
  <div class="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
    <!-- Top bar -->
    <div
      class="sticky top-0 z-40 border-b border-gray-200 bg-white/90 backdrop-blur dark:border-gray-800 dark:bg-gray-900/90"
    >
      <div
        class="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 sm:flex-nowrap sm:px-6 lg:px-8"
      >
        <span class="flex shrink-0 items-center gap-2 whitespace-nowrap text-lg font-bold">
          <EffizLogo :size="28" />
          Effiz Datepicker
          <span
            class="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500 dark:bg-gray-800"
          >
            v{{ meta.version }}
          </span>
        </span>
        <div class="ml-auto flex shrink-0 items-center gap-2">
          <a
            :href="meta.repository"
            target="_blank"
            rel="noopener"
            class="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800"
            >GitHub</a
          >
          <button
            type="button"
            class="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800"
            @click="toggleDark"
          >
            {{ dark ? '☀️' : '🌙' }}
          </button>
        </div>
      </div>

      <!-- Compact scroll-nav for small screens (the side panel replaces it on desktop). -->
      <nav
        class="flex gap-1 overflow-x-auto border-t border-gray-100 px-4 py-2 dark:border-gray-800 lg:hidden"
      >
        <a
          v-for="s in sections"
          :key="s.id"
          :href="`#${s.id}`"
          class="whitespace-nowrap rounded-md px-2.5 py-1 text-sm transition"
          :class="
            activeSection === s.id
              ? 'bg-indigo-600 text-white'
              : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
          "
        >
          {{ s.label }}
        </a>
      </nav>
    </div>

    <div class="mx-auto flex w-full max-w-7xl gap-8 px-4 sm:px-6 lg:px-8">
      <!-- Side panel: sticky table of contents with scroll progress -->
      <aside
        class="sticky top-16 hidden h-[calc(100vh-4rem)] w-56 shrink-0 self-start overflow-y-auto py-10 lg:block"
      >
        <p class="mb-3 px-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
          Sur cette page
        </p>
        <nav class="space-y-0.5">
          <a
            v-for="s in sections"
            :key="s.id"
            :href="`#${s.id}`"
            class="block border-l-2 py-1.5 pl-3 text-sm transition"
            :class="
              activeSection === s.id
                ? 'border-indigo-600 font-medium text-indigo-700 dark:border-indigo-400 dark:text-indigo-300'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
            "
            @click="activeSection = s.id"
          >
            {{ s.label }}
          </a>
        </nav>
      </aside>

      <main class="min-w-0 flex-1 py-10">
      <!-- Aperçu -->
      <section id="apercu" class="scroll-mt-24">
        <h1 class="text-4xl font-bold tracking-tight">Effiz Datepicker</h1>
        <p class="mt-3 max-w-3xl text-lg text-gray-600 dark:text-gray-300">
          {{ meta.description }}
        </p>
        <div class="mt-6 flex flex-wrap items-center gap-4">
          <label class="flex items-center gap-2 text-sm font-medium">
            Couleur primaire
            <input
              v-model="primaryColor"
              type="color"
              class="h-8 w-10 cursor-pointer rounded border border-gray-300 bg-transparent dark:border-gray-600"
            />
          </label>
          <div class="flex gap-2">
            <button
              v-for="color in presetColors"
              :key="color"
              type="button"
              class="h-7 w-7 rounded-full border-2 transition"
              :class="
                primaryColor === color ? 'border-gray-900 dark:border-white' : 'border-transparent'
              "
              :style="{ backgroundColor: color }"
              :aria-label="color"
              @click="primaryColor = color"
            />
          </div>
          <div class="max-w-xs flex-1">
            <EffizDatepicker
              v-model="singleDate"
              type="date"
              locale="fr-FR"
              placeholder="Essayez-moi…"
              :primary-color="primaryColor"
              :dark="dark"
            />
          </div>
        </div>
      </section>

      <!-- Installation -->
      <section id="installation" class="mt-14 scroll-mt-24">
        <h2 class="text-2xl font-semibold">Installation</h2>
        <div class="mt-4 grid gap-4 lg:grid-cols-2">
          <div class="min-w-0">
            <p class="mb-2 text-sm text-gray-600 dark:text-gray-400">{{ installExample.description }}</p>
            <CodeBlock :code="installExample.code" :lang="installExample.lang" />
            <p class="mb-2 mt-4 text-sm text-gray-600 dark:text-gray-400">
              {{ pluginExample.description }}
            </p>
            <CodeBlock :code="pluginExample.code" :lang="pluginExample.lang" />
          </div>
          <div class="min-w-0">
            <p class="mb-2 text-sm text-gray-600 dark:text-gray-400">{{ quickStart.description }}</p>
            <CodeBlock :code="quickStart.code" :lang="quickStart.lang" />
          </div>
        </div>
      </section>

      <!-- Exemples en direct -->
      <section id="exemples" class="mt-14 scroll-mt-24">
        <h2 class="text-2xl font-semibold">Exemples en direct</h2>
        <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Trois granularités (<code>date</code>, <code>month</code>, <code>year</code>), chacune
          disponible aussi en plage. La couleur et le thème ci-dessus s'appliquent partout.
        </p>
        <div class="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <section class="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
            <h3 class="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Date</h3>
            <EffizDatepicker v-model="singleDate" type="date" locale="fr-FR" placeholder="Choisir une date" :primary-color="primaryColor" :dark="dark" />
            <p class="mt-3 text-sm text-gray-500 dark:text-gray-400">{{ fmt(singleDate) }}</p>
          </section>
          <section class="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
            <h3 class="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Mois</h3>
            <EffizDatepicker v-model="singleMonth" type="month" locale="fr-FR" placeholder="Choisir un mois" :primary-color="primaryColor" :dark="dark" />
            <p class="mt-3 text-sm text-gray-500 dark:text-gray-400">{{ fmt(singleMonth) }}</p>
          </section>
          <section class="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
            <h3 class="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Année</h3>
            <EffizDatepicker v-model="singleYear" type="year" locale="fr-FR" placeholder="Choisir une année" :primary-color="primaryColor" :dark="dark" />
            <p class="mt-3 text-sm text-gray-500 dark:text-gray-400">{{ singleYear ? singleYear.getFullYear() : '—' }}</p>
          </section>
          <section class="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
            <h3 class="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Plage de dates</h3>
            <EffizDatepicker v-model="dateRange" type="date" range locale="fr-FR" placeholder="Du … au …" :primary-color="primaryColor" :dark="dark" />
            <p class="mt-3 text-sm text-gray-500 dark:text-gray-400">{{ fmt(dateRange) }}</p>
          </section>
          <section class="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
            <h3 class="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Plage de mois</h3>
            <EffizDatepicker v-model="monthRange" type="month" range locale="fr-FR" placeholder="De … à …" :primary-color="primaryColor" :dark="dark" />
            <p class="mt-3 text-sm text-gray-500 dark:text-gray-400">{{ fmt(monthRange) }}</p>
          </section>
          <section class="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
            <h3 class="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Plage d'années</h3>
            <EffizDatepicker v-model="yearRange" type="year" range locale="fr-FR" placeholder="De … à …" :primary-color="primaryColor" :dark="dark" />
            <p class="mt-3 text-sm text-gray-500 dark:text-gray-400">{{ fmt(yearRange) }}</p>
          </section>
          <section class="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
            <h3 class="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Bornes + jours désactivés</h3>
            <EffizDatepicker v-model="constrainedDate" type="date" locale="fr-FR" placeholder="Jours ouvrés, cette année" :min="minDate" :max="maxDate" :disabled-date="noWeekends" :primary-color="primaryColor" :dark="dark" />
            <p class="mt-3 text-sm text-gray-500 dark:text-gray-400">{{ fmt(constrainedDate) }}</p>
          </section>
          <section class="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800 md:col-span-2">
            <h3 class="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Inline (sans champ)</h3>
            <div class="flex flex-wrap items-start gap-4">
              <EffizDatepicker v-model="inlineDate" type="date" inline locale="fr-FR" :primary-color="primaryColor" :dark="dark" />
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ fmt(inlineDate) }}</p>
            </div>
          </section>
        </div>
      </section>

      <!-- Props -->
      <section id="props" class="mt-14 scroll-mt-24">
        <h2 class="text-2xl font-semibold">Props</h2>
        <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Communes à <code>EffizDatepicker</code> et <code>EffizCalendar</code>.
        </p>
        <div class="mt-4 overflow-x-auto">
          <table class="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr class="border-b border-gray-300 text-left dark:border-gray-600">
                <th class="py-2 pr-4 font-semibold">Prop</th>
                <th class="py-2 pr-4 font-semibold">Type</th>
                <th class="py-2 pr-4 font-semibold">Défaut</th>
                <th class="py-2 font-semibold">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in wrapperProps" :key="p.name" class="border-b border-gray-100 align-top dark:border-gray-800">
                <td class="py-2 pr-4"><code class="font-semibold text-indigo-600 dark:text-indigo-400">{{ p.name }}</code></td>
                <td class="py-2 pr-4"><code class="text-gray-600 dark:text-gray-400">{{ p.type }}</code></td>
                <td class="py-2 pr-4"><code class="text-gray-500">{{ p.default }}</code></td>
                <td class="py-2 text-gray-600 dark:text-gray-300">{{ p.description }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 class="mt-8 text-lg font-semibold">Props spécifiques au champ (<code>EffizDatepicker</code>)</h3>
        <div class="mt-3 overflow-x-auto">
          <table class="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr class="border-b border-gray-300 text-left dark:border-gray-600">
                <th class="py-2 pr-4 font-semibold">Prop</th>
                <th class="py-2 pr-4 font-semibold">Type</th>
                <th class="py-2 pr-4 font-semibold">Défaut</th>
                <th class="py-2 font-semibold">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in inputProps" :key="p.name" class="border-b border-gray-100 align-top dark:border-gray-800">
                <td class="py-2 pr-4"><code class="font-semibold text-indigo-600 dark:text-indigo-400">{{ p.name }}</code></td>
                <td class="py-2 pr-4"><code class="text-gray-600 dark:text-gray-400">{{ p.type }}</code></td>
                <td class="py-2 pr-4"><code class="text-gray-500">{{ p.default }}</code></td>
                <td class="py-2 text-gray-600 dark:text-gray-300">{{ p.description }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Événements -->
      <section id="evenements" class="mt-14 scroll-mt-24">
        <h2 class="text-2xl font-semibold">Événements</h2>
        <div class="mt-4 overflow-x-auto">
          <table class="w-full min-w-[560px] border-collapse text-sm">
            <thead>
              <tr class="border-b border-gray-300 text-left dark:border-gray-600">
                <th class="py-2 pr-4 font-semibold">Événement</th>
                <th class="py-2 pr-4 font-semibold">Payload</th>
                <th class="py-2 font-semibold">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="e in events" :key="e.name" class="border-b border-gray-100 align-top dark:border-gray-800">
                <td class="py-2 pr-4"><code class="font-semibold text-indigo-600 dark:text-indigo-400">{{ e.name }}</code></td>
                <td class="py-2 pr-4"><code class="text-gray-600 dark:text-gray-400">{{ e.payload }}</code></td>
                <td class="py-2 text-gray-600 dark:text-gray-300">{{ e.description }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Méthodes -->
      <section id="methodes" class="mt-14 scroll-mt-24">
        <h2 class="text-2xl font-semibold">Méthodes (via <code>ref</code>)</h2>
        <div class="mt-4 overflow-x-auto">
          <table class="w-full min-w-[560px] border-collapse text-sm">
            <thead>
              <tr class="border-b border-gray-300 text-left dark:border-gray-600">
                <th class="py-2 pr-4 font-semibold">Méthode</th>
                <th class="py-2 pr-4 font-semibold">Signature</th>
                <th class="py-2 font-semibold">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="m in methods" :key="m.name" class="border-b border-gray-100 align-top dark:border-gray-800">
                <td class="py-2 pr-4"><code class="font-semibold text-indigo-600 dark:text-indigo-400">{{ m.name }}</code></td>
                <td class="py-2 pr-4"><code class="text-gray-600 dark:text-gray-400">{{ m.signature }}</code></td>
                <td class="py-2 text-gray-600 dark:text-gray-300">{{ m.description }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Types -->
      <section id="types" class="mt-14 scroll-mt-24">
        <h2 class="text-2xl font-semibold">Types TypeScript</h2>
        <div class="mt-4 overflow-x-auto">
          <table class="w-full min-w-[560px] border-collapse text-sm">
            <thead>
              <tr class="border-b border-gray-300 text-left dark:border-gray-600">
                <th class="py-2 pr-4 font-semibold">Type</th>
                <th class="py-2 pr-4 font-semibold">Définition</th>
                <th class="py-2 font-semibold">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="t in types" :key="t.name" class="border-b border-gray-100 align-top dark:border-gray-800">
                <td class="py-2 pr-4"><code class="font-semibold text-indigo-600 dark:text-indigo-400">{{ t.name }}</code></td>
                <td class="py-2 pr-4"><code class="text-gray-600 dark:text-gray-400">{{ t.definition }}</code></td>
                <td class="py-2 text-gray-600 dark:text-gray-300">{{ t.description }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Thème -->
      <section id="theme" class="mt-14 scroll-mt-24">
        <h2 class="text-2xl font-semibold">Thème — variables CSS</h2>
        <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Toutes surchargeables sur <code>.effiz-dp</code>. Le mode sombre s'active via la prop
          <code>dark</code> ou une classe <code>.dark</code> sur un ancêtre.
        </p>
        <div class="mt-4 overflow-x-auto">
          <table class="w-full min-w-[560px] border-collapse text-sm">
            <thead>
              <tr class="border-b border-gray-300 text-left dark:border-gray-600">
                <th class="py-2 pr-4 font-semibold">Variable</th>
                <th class="py-2 pr-4 font-semibold">Défaut</th>
                <th class="py-2 font-semibold">Rôle</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="v in cssVars" :key="v.name" class="border-b border-gray-100 align-top dark:border-gray-800">
                <td class="py-2 pr-4"><code class="font-semibold text-indigo-600 dark:text-indigo-400">{{ v.name }}</code></td>
                <td class="py-2 pr-4"><code class="text-gray-500">{{ v.default }}</code></td>
                <td class="py-2 text-gray-600 dark:text-gray-300">{{ v.description }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Clavier -->
      <section id="clavier" class="mt-14 scroll-mt-24">
        <h2 class="text-2xl font-semibold">Navigation clavier & accessibilité</h2>
        <div class="mt-4 overflow-x-auto">
          <table class="w-full min-w-[560px] border-collapse text-sm">
            <thead>
              <tr class="border-b border-gray-300 text-left dark:border-gray-600">
                <th class="py-2 pr-4 font-semibold">Touches</th>
                <th class="py-2 pr-4 font-semibold">Contexte</th>
                <th class="py-2 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="k in keyboard" :key="k.keys" class="border-b border-gray-100 align-top dark:border-gray-800">
                <td class="py-2 pr-4"><code class="font-semibold">{{ k.keys }}</code></td>
                <td class="py-2 pr-4 text-gray-500">{{ k.context }}</td>
                <td class="py-2 text-gray-600 dark:text-gray-300">{{ k.action }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Recettes -->
      <section id="recettes" class="mt-14 scroll-mt-24">
        <h2 class="text-2xl font-semibold">Recettes & exemples de code</h2>
        <div class="mt-5 grid gap-6 lg:grid-cols-2">
          <div v-for="ex in examples" :key="ex.id" class="min-w-0">
            <h3 class="text-base font-semibold">{{ ex.title }}</h3>
            <p class="mb-2 mt-0.5 text-sm text-gray-600 dark:text-gray-400">{{ ex.description }}</p>
            <CodeBlock :code="ex.code" :lang="ex.lang" />
          </div>
        </div>
      </section>

      <!-- Pour les IA / machines -->
      <section id="ia" class="mt-14 scroll-mt-24">
        <h2 class="text-2xl font-semibold">Ressources pour machines & IA</h2>
        <p class="mt-1 max-w-3xl text-sm text-gray-600 dark:text-gray-400">
          Toute cette documentation est disponible dans des formats structurés, faciles à ingérer
          par un agent ou un LLM. Ces fichiers sont générés depuis une source unique de vérité, donc
          toujours synchronisés avec le composant.
        </p>
        <div class="mt-5 grid gap-4 sm:grid-cols-3">
          <a href="./llms.txt" class="block rounded-xl border border-gray-200 bg-white p-5 transition hover:border-indigo-400 hover:shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div class="font-mono text-sm font-semibold text-indigo-600 dark:text-indigo-400">llms.txt</div>
            <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">Index concis (convention llmstxt.org) : faits clés et liens.</p>
          </a>
          <a href="./llms-full.txt" class="block rounded-xl border border-gray-200 bg-white p-5 transition hover:border-indigo-400 hover:shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div class="font-mono text-sm font-semibold text-indigo-600 dark:text-indigo-400">llms-full.txt</div>
            <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">Référence complète en Markdown : API, types, variables CSS, exemples.</p>
          </a>
          <a href="./api.json" class="block rounded-xl border border-gray-200 bg-white p-5 transition hover:border-indigo-400 hover:shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div class="font-mono text-sm font-semibold text-indigo-600 dark:text-indigo-400">api.json</div>
            <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">API structurée : props, événements, méthodes, types et exemples.</p>
          </a>
        </div>
      </section>

        <footer class="mt-16 border-t border-gray-200 pt-6 text-sm text-gray-500 dark:border-gray-800">
          {{ meta.name }} v{{ meta.version }} — Licence {{ meta.license }} —
          <a :href="meta.repository" class="underline" target="_blank" rel="noopener">GitHub</a>
        </footer>
      </main>
    </div>
  </div>
</template>

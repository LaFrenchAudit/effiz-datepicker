<script setup lang="ts">
import { computed, ref } from 'vue'
import { EffizDatepicker, type DatepickerModel, type RangeValue } from '../index'

const singleDate = ref<Date | null>(null)
const singleMonth = ref<Date | null>(null)
const singleYear = ref<Date | null>(null)

const dateRange = ref<RangeValue>([null, null])
const monthRange = ref<RangeValue>([null, null])
const yearRange = ref<RangeValue>([null, null])

const inlineDate = ref<Date | null>(new Date())

const primaryColor = ref('#1a56db')
const dark = ref(false)

// Constrain the "min/max + disabled" example to the current year, no weekends.
const now = new Date()
const minDate = new Date(now.getFullYear(), 0, 1)
const maxDate = new Date(now.getFullYear(), 11, 31)
const constrainedDate = ref<Date | null>(null)
function noWeekends(date: Date) {
  const day = date.getDay()
  return day === 0 || day === 6
}

function fmt(value: DatepickerModel): string {
  if (Array.isArray(value)) {
    return value.map((d) => (d ? d.toLocaleDateString('fr-FR') : '—')).join(' → ')
  }
  return value ? value.toLocaleDateString('fr-FR') : '—'
}

const presetColors = ['#1a56db', '#16a34a', '#db2777', '#ea580c', '#7c3aed', '#0891b2']

function toggleDark() {
  dark.value = !dark.value
  document.documentElement.classList.toggle('dark', dark.value)
}

const monthLabel = computed(() =>
  singleMonth.value
    ? singleMonth.value.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    : '—',
)
</script>

<template>
  <div class="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
    <div class="mx-auto max-w-5xl px-4 py-10">
      <header class="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold tracking-tight">Effiz Datepicker</h1>
          <p class="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
            Composant Vue 3 façon Flowbite, sans dépendance à Flowbite. Sélection de date, de
            mois, d'année — chacune disponible aussi en plage (range).
          </p>
        </div>
        <div class="flex items-center gap-3">
          <label class="flex items-center gap-2 text-sm">
            <span>Couleur</span>
            <input
              v-model="primaryColor"
              type="color"
              class="h-8 w-10 cursor-pointer rounded border border-gray-300 bg-transparent dark:border-gray-600"
            />
          </label>
          <button
            type="button"
            class="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800"
            @click="toggleDark"
          >
            {{ dark ? '☀️ Clair' : '🌙 Sombre' }}
          </button>
        </div>
      </header>

      <div class="mb-8 flex flex-wrap gap-2">
        <button
          v-for="color in presetColors"
          :key="color"
          type="button"
          class="h-7 w-7 rounded-full border-2 transition"
          :class="primaryColor === color ? 'border-gray-900 dark:border-white' : 'border-transparent'"
          :style="{ backgroundColor: color }"
          :aria-label="color"
          @click="primaryColor = color"
        />
      </div>

      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <!-- Single date -->
        <section class="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          <h2 class="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Date</h2>
          <EffizDatepicker
            v-model="singleDate"
            type="date"
            locale="fr-FR"
            placeholder="Choisir une date"
            :primary-color="primaryColor"
            :dark="dark"
          />
          <p class="mt-3 text-sm text-gray-500 dark:text-gray-400">Valeur : {{ fmt(singleDate) }}</p>
        </section>

        <!-- Single month -->
        <section class="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          <h2 class="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Mois</h2>
          <EffizDatepicker
            v-model="singleMonth"
            type="month"
            locale="fr-FR"
            placeholder="Choisir un mois"
            :primary-color="primaryColor"
            :dark="dark"
          />
          <p class="mt-3 text-sm text-gray-500 dark:text-gray-400">Valeur : {{ monthLabel }}</p>
        </section>

        <!-- Single year -->
        <section class="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          <h2 class="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Année</h2>
          <EffizDatepicker
            v-model="singleYear"
            type="year"
            locale="fr-FR"
            placeholder="Choisir une année"
            :primary-color="primaryColor"
            :dark="dark"
          />
          <p class="mt-3 text-sm text-gray-500 dark:text-gray-400">
            Valeur : {{ singleYear ? singleYear.getFullYear() : '—' }}
          </p>
        </section>

        <!-- Date range -->
        <section class="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          <h2 class="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Plage de dates
          </h2>
          <EffizDatepicker
            v-model="dateRange"
            type="date"
            range
            locale="fr-FR"
            placeholder="Du … au …"
            :primary-color="primaryColor"
            :dark="dark"
          />
          <p class="mt-3 text-sm text-gray-500 dark:text-gray-400">Valeur : {{ fmt(dateRange) }}</p>
        </section>

        <!-- Month range -->
        <section class="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          <h2 class="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Plage de mois
          </h2>
          <EffizDatepicker
            v-model="monthRange"
            type="month"
            range
            locale="fr-FR"
            placeholder="De … à …"
            :primary-color="primaryColor"
            :dark="dark"
          />
          <p class="mt-3 text-sm text-gray-500 dark:text-gray-400">Valeur : {{ fmt(monthRange) }}</p>
        </section>

        <!-- Year range -->
        <section class="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          <h2 class="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Plage d'années
          </h2>
          <EffizDatepicker
            v-model="yearRange"
            type="year"
            range
            locale="fr-FR"
            placeholder="De … à …"
            :primary-color="primaryColor"
            :dark="dark"
          />
          <p class="mt-3 text-sm text-gray-500 dark:text-gray-400">Valeur : {{ fmt(yearRange) }}</p>
        </section>

        <!-- Constrained -->
        <section class="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          <h2 class="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Bornes + jours désactivés
          </h2>
          <EffizDatepicker
            v-model="constrainedDate"
            type="date"
            locale="fr-FR"
            placeholder="Jours ouvrés, cette année"
            :min="minDate"
            :max="maxDate"
            :disabled-date="noWeekends"
            :primary-color="primaryColor"
            :dark="dark"
          />
          <p class="mt-3 text-sm text-gray-500 dark:text-gray-400">
            Valeur : {{ fmt(constrainedDate) }}
          </p>
        </section>

        <!-- Inline -->
        <section
          class="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800 md:col-span-2"
        >
          <h2 class="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Inline (sans champ)
          </h2>
          <div class="flex flex-wrap items-start gap-4">
            <EffizDatepicker
              v-model="inlineDate"
              type="date"
              inline
              locale="fr-FR"
              :primary-color="primaryColor"
              :dark="dark"
            />
            <p class="text-sm text-gray-500 dark:text-gray-400">Valeur : {{ fmt(inlineDate) }}</p>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

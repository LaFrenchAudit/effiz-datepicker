/**
 * Generates the machine- and AI-readable documentation artifacts from the
 * single source of truth (src/demo/api-spec.js):
 *
 *   public/api.json        structured API (props, events, types, css vars…)
 *   public/llms.txt        concise index following the llms.txt convention
 *   public/llms-full.txt   full reference in Markdown, ready for LLM ingestion
 *
 * These land at the site root once the demo is built (Vite copies public/),
 * i.e. https://lafrenchaudit.github.io/effiz-datepicker/{api.json,llms.txt,…}
 *
 * Run: `node scripts/gen-docs.mjs` (also chained before `dev` and `build:demo`).
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  cssVars,
  events,
  examples,
  keyboard,
  meta,
  methods,
  props,
  types,
} from '../src/demo/api-spec.js'

const here = dirname(fileURLToPath(import.meta.url))
const outDir = resolve(here, '../public')
mkdirSync(outDir, { recursive: true })

// The Vue app reads the version from import.meta.env at Vite build time; this
// Node script gets it from the environment so api.json/llms*.txt stay in sync.
if (process.env.VITE_APP_VERSION) {
  meta.version = process.env.VITE_APP_VERSION
}

const base = meta.demo.replace(/\/$/, '')

/* --------------------------------------------------------------- api.json */

const apiJson = {
  $generator: 'scripts/gen-docs.mjs',
  $note: 'Machine-readable API for @effiz/datepicker. Single source of truth: src/demo/api-spec.js.',
  name: meta.name,
  version: meta.version,
  title: meta.title,
  description: meta.description,
  framework: meta.framework,
  peerDependencies: meta.peerDependencies,
  license: meta.license,
  repository: meta.repository,
  demo: meta.demo,
  install: meta.install,
  cssImport: meta.cssImport,
  components: meta.components,
  props,
  events,
  methods,
  cssVariables: cssVars,
  types,
  keyboard,
  examples,
}

writeFileSync(resolve(outDir, 'api.json'), JSON.stringify(apiJson, null, 2) + '\n', 'utf8')

/* -------------------------------------------------------- markdown helpers */

function table(headers, rows) {
  const head = `| ${headers.join(' | ')} |`
  const sep = `| ${headers.map(() => '---').join(' | ')} |`
  const body = rows
    .map((cols) => `| ${cols.map((c) => String(c).replace(/\|/g, '\\|').replace(/\n/g, ' ')).join(' | ')} |`)
    .join('\n')
  return `${head}\n${sep}\n${body}`
}

function code(lang, content) {
  return '```' + lang + '\n' + content + '\n```'
}

/* --------------------------------------------------------------- llms.txt */

const llms = `# ${meta.title}

> ${meta.description}

- Paquet : \`${meta.name}\` (v${meta.version}) — ${meta.framework}, licence ${meta.license}.
- Installation : \`${meta.install}\` puis \`${meta.cssImport}\`.
- Composants exportés : ${meta.components.map((c) => `\`${c}\``).join(', ')}.
- Styles encapsulés : Tailwind n'est PAS requis dans le projet consommateur.
- 3 granularités (\`type\` = date | month | year), chacune disponible en plage (\`range\`).
- Couleur primaire personnalisable (prop \`primary-color\` ou variable CSS \`--effiz-dp-primary\`).

## Documentation
- [Référence complète (Markdown)](${base}/llms-full.txt): API exhaustive, exemples, types, variables CSS, clavier.
- [API structurée (JSON)](${base}/api.json): props, événements, méthodes, types et exemples au format JSON.
- [Démo interactive et documentation](${base}/): toutes les variantes en direct.
- [Code source](${meta.repository})

## Résumé de l'API
- Props principales : ${props.slice(0, 8).map((p) => `\`${p.name}\``).join(', ')}, …
- Événements : ${events.map((e) => `\`${e.name}\``).join(', ')}.
- v-model : \`Date | null\` (simple) ou \`[Date | null, Date | null]\` (range).
`

writeFileSync(resolve(outDir, 'llms.txt'), llms, 'utf8')

/* ---------------------------------------------------------- llms-full.txt */

const propRows = props.map((p) => [
  `\`${p.name}\``,
  `\`${p.type}\``,
  `\`${p.default}\``,
  p.component ? p.component : 'les deux',
  p.description,
])

const eventRows = events.map((e) => [`\`${e.name}\``, `\`${e.payload}\``, e.description])
const methodRows = methods.map((m) => [`\`${m.name}\``, `\`${m.signature}\``, m.description])
const cssRows = cssVars.map((v) => [`\`${v.name}\``, `\`${v.default}\``, v.description])
const typeRows = types.map((t) => [`\`${t.name}\``, `\`${t.definition}\``, t.description])
const keyRows = keyboard.map((k) => [`\`${k.keys}\``, k.context, k.action])

const full = `# ${meta.title} — Référence complète

> ${meta.description}

- **Paquet :** \`${meta.name}\` (v${meta.version})
- **Framework :** ${meta.framework} — **Licence :** ${meta.license}
- **Dépôt :** ${meta.repository}
- **Démo :** ${meta.demo}
- **Poids :** ${meta.bundleSize}
- **API JSON :** ${base}/api.json

## Points clés
- Composant datepicker Vue 3 au style Flowbite, **sans dépendance à Flowbite**.
- **3 granularités** via \`type\` : \`date\`, \`month\`, \`year\`.
- **Mode plage** via \`range\` pour chacune des granularités.
- **Couleur primaire personnalisable** (\`primary-color\` / \`--effiz-dp-primary\`).
- **Thème clair/sombre**, **localisation Intl**, **navigation clavier**, **ARIA**.
- **Styles encapsulés** : Tailwind non requis côté projet consommateur.

## Installation
${code('bash', meta.install)}

Vue 3 (>= 3.3) est une peerDependency.

## Import
${code('ts', `import { EffizDatepicker, EffizCalendar } from '${meta.name}'\n${meta.cssImport}`)}

Ou en plugin global :
${code('ts', `import { EffizDatepickerPlugin } from '${meta.name}'\n${meta.cssImport}\napp.use(EffizDatepickerPlugin)`)}

## Composants
- **EffizDatepicker** — champ texte + popover (usage courant).
- **EffizCalendar** — calendrier inline bas niveau (mêmes props de sélection, sans le champ).

## Props
${table(['Prop', 'Type', 'Défaut', 'Composant', 'Description'], propRows)}

## Événements
${table(['Événement', 'Payload', 'Description'], eventRows)}

## Méthodes (via template ref)
${table(['Méthode', 'Signature', 'Description'], methodRows)}

## Variables CSS (thème)
Toutes surchargeables sur \`.effiz-dp\`. Le mode sombre s'active via la prop \`dark\` ou une classe \`.dark\` sur un ancêtre.

${table(['Variable', 'Défaut', 'Rôle'], cssRows)}

## Types TypeScript
${table(['Type', 'Définition', 'Description'], typeRows)}

## Navigation clavier
${table(['Touches', 'Contexte', 'Action'], keyRows)}

## Exemples
${examples.map((ex) => `### ${ex.title}\n${ex.description}\n\n${code(ex.lang, ex.code)}`).join('\n\n')}

## Notes pour l'intégration
- La valeur émise est **toujours** un objet \`Date\` (ou un tuple de \`Date\`). En entrée, une chaîne ISO ou un timestamp sont acceptés et convertis.
- En \`type="month"\`, la date émise est le **1er du mois** ; en \`type="year"\`, le **1er janvier**.
- En mode \`range\`, le composant est *controlled* : réinjectez la valeur via \`v-model\` pour que la seconde sélection complète la plage.
- \`min\`/\`max\` et \`disabledDate\` sont comparés à la **granularité de \`type\`**.
`

writeFileSync(resolve(outDir, 'llms-full.txt'), full, 'utf8')

console.log('Generated: public/api.json, public/llms.txt, public/llms-full.txt')

export interface ApiMeta {
  name: string
  version: string
  title: string
  description: string
  repository: string
  demo: string
  license: string
  framework: string
  peerDependencies: Record<string, string>
  install: string
  components: string[]
  cssImport: string
  bundleSize: string
}

export interface ApiProp {
  name: string
  type: string
  default: string
  required: boolean
  values?: string[]
  component?: string
  description: string
}

export interface ApiEvent {
  name: string
  payload: string
  description: string
}

export interface ApiMethod {
  name: string
  signature: string
  description: string
}

export interface ApiCssVar {
  name: string
  default: string
  description: string
}

export interface ApiType {
  name: string
  definition: string
  description: string
}

export interface ApiKeyboard {
  keys: string
  context: string
  action: string
}

export interface ApiExample {
  id: string
  title: string
  lang: string
  description: string
  code: string
}

export const meta: ApiMeta
export const props: ApiProp[]
export const events: ApiEvent[]
export const methods: ApiMethod[]
export const cssVars: ApiCssVar[]
export const types: ApiType[]
export const keyboard: ApiKeyboard[]
export const examples: ApiExample[]

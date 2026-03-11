export type Framework = 'Next.js' | 'Remix' | 'Vite React' | 'SvelteKit' | 'Nuxt' | 'Other'
export type PackageManager = 'bun' | 'npm' | 'yarn' | 'pnpm'

export interface ProjectConfig {
  name: string
  repoPath: string
  framework: Framework | ''
  packageManager: PackageManager
  language: 'TypeScript' | 'JavaScript'
  deployTarget: string
  description: string
}

export interface MCPEnvVar {
  key: string
  label: string
  placeholder: string
  value: string
}

export interface MCPServer {
  id: string
  name: string
  service: string
  purpose: string
  configKey: string
  npmPackage: string
  args: string[]
  envVars: MCPEnvVar[]
  enabled: boolean
  tier: 'adopt' | 'evaluate'
}

export interface Skill {
  id: string
  name: string
  purpose: string
  whenToUse: string
  inputs: Array<{ name: string; description: string }>
  process: string[]
  output: string
  rules: string[]
  example: string
}

export interface Hook {
  id: string
  name: string
  trigger: 'PostToolUse' | 'Stop' | 'PreToolUse'
  matcher: string
  command: string
  purpose: string
  enabled: boolean
}

export interface RulesFile {
  id: string
  domain: string
  content: string
}

export interface SpecSection {
  id: string
  name: string
  purpose: string
  layout: string
  content: string
  assets: string
  states: string
  breakpoints: string
}

export interface SpecAsset {
  id: string
  name: string
  path: string
  dimensions: string
  format: string
  altText: string
}

export interface SpecChecklist {
  purposeStated: boolean
  componentsNamed: boolean
  copyFinalised: boolean
  dataSourcesIdentified: boolean
  assetsSpecified: boolean
  visualLayoutDescribed: boolean
  responsiveBehaviour: boolean
  interactiveStates: boolean
  linksHaveDestinations: boolean
  acceptanceCriteria: boolean
  performanceTargets: boolean
  accessibilityRequirements: boolean
  seoMetadata: boolean
  dependenciesListed: boolean
}

export interface Spec {
  id: string
  featureName: string
  domain: string
  overview: string
  inScope: string[]
  outOfScope: string[]
  sections: SpecSection[]
  assets: SpecAsset[]
  acceptanceCriteria: string[]
  constraints: string[]
  dependsOn: string[]
  blocks: string[]
  checklist: SpecChecklist
}

export interface LinearConfig {
  apiKey: string
  teamId: string
  projectId: string
}

export interface AppState {
  currentStep: number
  project: ProjectConfig
  mcps: MCPServer[]
  skills: Skill[]
  hooks: Hook[]
  rules: RulesFile[]
  specs: Spec[]
  linear: LinearConfig
}

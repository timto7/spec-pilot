import type { AppState, Spec, Skill } from '../types'

interface FileEntry {
  path: string
  content: string
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-_]/g, '')
    .replace(/-+/g, '-')
    .trim()
}

function generateClaudeJson(state: AppState): string {
  const enabledMCPs = state.mcps.filter(m => m.enabled)
  const mcpServers: Record<string, unknown> = {}

  for (const mcp of enabledMCPs) {
    const env: Record<string, string> = {}
    for (const ev of mcp.envVars) {
      if (ev.value) env[ev.key] = ev.value
    }
    mcpServers[mcp.configKey] = {
      command: 'npx',
      args: ['-y', mcp.npmPackage, ...mcp.args],
      ...(Object.keys(env).length > 0 ? { env } : {}),
    }
  }

  return JSON.stringify({ mcpServers }, null, 2)
}

function generateSettingsJson(state: AppState): string {
  const enabledHooks = state.hooks.filter(h => h.enabled)

  const postToolUse = enabledHooks
    .filter(h => h.trigger === 'PostToolUse')
    .map(h => ({
      matcher: h.matcher,
      hooks: [{ type: 'command', command: h.command }],
    }))

  const stop = enabledHooks
    .filter(h => h.trigger === 'Stop')
    .map(h => ({
      hooks: [{ type: 'command', command: h.command }],
    }))

  const preToolUse = enabledHooks
    .filter(h => h.trigger === 'PreToolUse')
    .map(h => ({
      matcher: h.matcher,
      hooks: [{ type: 'command', command: h.command }],
    }))

  const hooks: Record<string, unknown[]> = {}
  if (postToolUse.length) hooks.PostToolUse = postToolUse
  if (stop.length) hooks.Stop = stop
  if (preToolUse.length) hooks.PreToolUse = preToolUse

  return JSON.stringify({ hooks }, null, 2)
}

function generateSkillMd(skill: Skill): string {
  const inputs = skill.inputs.filter(i => i.name)
  const process = skill.process.filter(Boolean)
  const rules = skill.rules.filter(Boolean)

  return `# Skill: ${skill.name}

## Purpose
${skill.purpose || '_Not specified_'}

## When to Use
${skill.whenToUse || '_Not specified_'}

## Inputs
${inputs.length ? inputs.map(i => `- **${i.name}**: ${i.description}`).join('\n') : '_None_'}

## Process
${process.length ? process.map((p, i) => `${i + 1}. ${p}`).join('\n') : '_Not specified_'}

## Output
${skill.output || '_Not specified_'}

## Rules
${rules.length ? rules.map(r => `- ${r}`).join('\n') : '_None_'}

## Example
\`\`\`
${skill.example || '_No example provided_'}
\`\`\`
`
}

function generateSpecMd(spec: Spec): string {
  const inScope = spec.inScope.filter(Boolean)
  const outOfScope = spec.outOfScope.filter(Boolean)
  const acceptanceCriteria = spec.acceptanceCriteria.filter(Boolean)
  const constraints = spec.constraints.filter(Boolean)
  const dependsOn = spec.dependsOn.filter(Boolean)
  const blocks = spec.blocks.filter(Boolean)

  const sectionsBlock = spec.sections.map(s => `### ${s.name || 'Unnamed Section'}

**Purpose:** ${s.purpose || '_Not specified_'}
**Layout:** ${s.layout || '_Not specified_'}
**Content:** ${s.content || '_Not specified_'}
**Assets:** ${s.assets || '_None_'}
**States:** ${s.states || '_Not specified_'}
**Breakpoints:** ${s.breakpoints || '_Not specified_'}
`).join('\n')

  const assetsBlock = spec.assets.length
    ? `| Name | Path | Dimensions | Format | Alt Text |
|------|------|-----------|--------|----------|
${spec.assets.map(a => `| ${a.name} | ${a.path} | ${a.dimensions} | ${a.format} | ${a.altText} |`).join('\n')}`
    : '_No assets specified_'

  const checklistItems = Object.entries(spec.checklist) as [string, boolean][]
  const checklistBlock = checklistItems.map(([key, val]) => {
    const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())
    return `- [${val ? 'x' : ' '}] ${label}`
  }).join('\n')

  return `# Spec: ${spec.featureName}

**Domain:** ${spec.domain || '_Not specified_'}
**Status:** Draft

## Overview
${spec.overview || '_Not specified_'}

## Scope

### In Scope
${inScope.length ? inScope.map(i => `- ${i}`).join('\n') : '_Not specified_'}

### Out of Scope
${outOfScope.length ? outOfScope.map(i => `- ${i}`).join('\n') : '_Not specified_'}

## Sections
${sectionsBlock || '_No sections defined_'}

## Assets
${assetsBlock}

## Acceptance Criteria
${acceptanceCriteria.length ? acceptanceCriteria.map((c, i) => `${i + 1}. ${c}`).join('\n') : '_Not specified_'}

## Constraints
${constraints.length ? constraints.map(c => `- ${c}`).join('\n') : '_None_'}

## Dependencies

### Depends On
${dependsOn.length ? dependsOn.map(d => `- ${d}`).join('\n') : '_None_'}

### Blocks
${blocks.length ? blocks.map(b => `- ${b}`).join('\n') : '_None_'}

## Completeness Checklist
${checklistBlock}
`
}

function generateClaudeMd(state: AppState): string {
  const { project, mcps, skills, rules, specs } = state
  const enabledMCPs = mcps.filter(m => m.enabled)

  const mcpSection = enabledMCPs.length
    ? enabledMCPs.map(m => `- **${m.name}** (\`${m.npmPackage}\`): ${m.purpose}`).join('\n')
    : '_No MCPs configured_'

  const skillsSection = skills.length
    ? skills.map(s => `- **/${s.name}**: ${s.purpose}`).join('\n')
    : '_No skills defined_'

  const rulesSection = rules.length
    ? rules.map(r => `- [\`${r.domain}.md\`](.claude/rules/${r.domain}.md)`).join('\n')
    : '_No rules defined_'

  const specsSection = specs.length
    ? specs.map(s => `- [\`${s.featureName}\`](specs/${s.domain || 'general'}/${slugify(s.featureName)}.md)`).join('\n')
    : '_No specs defined_'

  return `# ${project.name}

${project.description || '_No description provided_'}

## Project Info

| Field | Value |
|-------|-------|
| Framework | ${project.framework || '_Not specified_'} |
| Package Manager | ${project.packageManager} |
| Language | ${project.language} |
| Deploy Target | ${project.deployTarget || '_Not specified_'} |
| Repository | \`${project.repoPath}\` |

## MCP Servers

${mcpSection}

## Claude Code Skills

Invoke with \`/skill-name\` in a Claude Code session.

${skillsSection}

## Rules Files

Domain-specific rules Claude loads as context:

${rulesSection}

## Specs

Feature specifications:

${specsSection}

## Getting Started

1. Open this repo in Claude Code
2. Claude will automatically load this \`CLAUDE.md\` as context
3. MCP servers are configured in \`.claude/claude.json\`
4. Hooks are configured in \`.claude/settings.json\`
5. Invoke skills with \`/skill-name\` syntax
6. Reference specs when starting feature work

---
_Generated by SpecPilot_
`
}

function generateSpecTemplate(): string {
  return `# Spec: [Feature Name]

**Domain:** [domain]
**Status:** Draft

## Overview
[High-level description of the feature and its purpose]

## Scope

### In Scope
- [Feature or behaviour included]

### Out of Scope
- [Explicitly excluded items]

## Sections

### [Section Name]
**Purpose:** [What this section achieves]
**Layout:** [Layout description]
**Content:** [Content description]
**Assets:** [Asset references]
**States:** [UI states: default, hover, loading, empty, error]
**Breakpoints:** [Responsive behaviour]

## Assets
| Name | Path | Dimensions | Format | Alt Text |
|------|------|-----------|--------|----------|
| | | | | |

## Acceptance Criteria
1. Given [context], when [action], then [outcome]

## Constraints
- [Technical or business constraints]

## Dependencies

### Depends On
- [Other specs or features this depends on]

### Blocks
- [Specs or features that cannot start until this is done]

## Completeness Checklist
- [ ] Purpose is clearly stated
- [ ] All components are named
- [ ] Copy / text content is finalised
- [ ] Data sources are identified
- [ ] All assets are specified
- [ ] Visual layout is described
- [ ] Responsive behaviour is documented
- [ ] Interactive states are documented
- [ ] All links have destinations
- [ ] Acceptance criteria written
- [ ] Performance targets defined
- [ ] Accessibility requirements specified
- [ ] SEO metadata defined
- [ ] Dependencies and blocks listed
`
}

export function generateFiles(state: AppState): FileEntry[] {
  const files: FileEntry[] = []

  // .claude/claude.json
  files.push({
    path: '.claude/claude.json',
    content: generateClaudeJson(state),
  })

  // .claude/settings.json
  files.push({
    path: '.claude/settings.json',
    content: generateSettingsJson(state),
  })

  // Skills
  for (const skill of state.skills) {
    if (skill.name) {
      files.push({
        path: `.claude/skills/${slugify(skill.name)}.md`,
        content: generateSkillMd(skill),
      })
    }
  }

  // Rules
  for (const rule of state.rules) {
    if (rule.domain) {
      files.push({
        path: `.claude/rules/${slugify(rule.domain)}.md`,
        content: rule.content,
      })
    }
  }

  // Specs
  for (const spec of state.specs) {
    if (spec.featureName) {
      const domain = spec.domain ? slugify(spec.domain) : 'general'
      files.push({
        path: `specs/${domain}/${slugify(spec.featureName)}.md`,
        content: generateSpecMd(spec),
      })
    }
  }

  // CLAUDE.md
  files.push({
    path: 'CLAUDE.md',
    content: generateClaudeMd(state),
  })

  // specs/_template.md
  files.push({
    path: 'specs/_template.md',
    content: generateSpecTemplate(),
  })

  return files
}

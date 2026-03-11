import { LinearClient } from '@linear/sdk'
import type { LinearConfig, Spec } from '../types'

export interface LinearTeam {
  id: string
  name: string
}

export interface ValidateResult {
  valid: boolean
  teams: LinearTeam[]
  error?: string
}

export async function validateLinearKey(apiKey: string): Promise<ValidateResult> {
  if (!apiKey.trim()) {
    return { valid: false, teams: [], error: 'API key is required' }
  }

  try {
    const client = new LinearClient({ apiKey })
    const teamsResult = await client.teams()
    const teams: LinearTeam[] = teamsResult.nodes.map(t => ({ id: t.id, name: t.name }))
    return { valid: true, teams }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return { valid: false, teams: [], error: `Invalid API key or network error: ${message}` }
  }
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-_]/g, '')
    .replace(/-+/g, '-')
    .trim()
}

function buildTicketDescription(spec: Spec, projectName: string): string {
  const domain = spec.domain ? slugify(spec.domain) : 'general'
  const featureSlug = slugify(spec.featureName)
  const specPath = `specs/${domain}/${featureSlug}.md`

  const criteria = spec.acceptanceCriteria.filter(Boolean)
  const inScope = spec.inScope.filter(Boolean)
  const outOfScope = spec.outOfScope.filter(Boolean)

  return `## Overview
${spec.overview || '_No overview provided_'}

## Spec File
\`${specPath}\`

## Scope

**In Scope:**
${inScope.length ? inScope.map(i => `- ${i}`).join('\n') : '- _Not specified_'}

**Out of Scope:**
${outOfScope.length ? outOfScope.map(i => `- ${i}`).join('\n') : '- _None specified_'}

## Acceptance Criteria
${criteria.length ? criteria.map((c, i) => `${i + 1}. ${c}`).join('\n') : '_Not specified_'}

## Context
- **Project:** ${projectName}
- **Domain:** ${spec.domain || '_Not specified_'}

---
_Created by SpecPilot_
`
}

export interface CreateTicketsResult {
  created: number
  urls: string[]
  errors: string[]
}

export async function createTickets(
  config: LinearConfig,
  specs: Spec[],
  projectName: string
): Promise<CreateTicketsResult> {
  if (!config.apiKey.trim() || !config.teamId.trim()) {
    throw new Error('API key and Team ID are required')
  }

  const client = new LinearClient({ apiKey: config.apiKey })
  const urls: string[] = []
  const errors: string[] = []

  for (const spec of specs) {
    if (!spec.featureName) continue

    try {
      const input: {
        teamId: string
        title: string
        description: string
        projectId?: string
      } = {
        teamId: config.teamId,
        title: spec.featureName,
        description: buildTicketDescription(spec, projectName),
      }

      if (config.projectId.trim()) {
        input.projectId = config.projectId.trim()
      }

      const result = await client.createIssue(input)
      const issue = await result.issue

      if (issue?.url) {
        urls.push(issue.url)
      } else {
        urls.push(`Created: ${spec.featureName}`)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      errors.push(`Failed to create ticket for "${spec.featureName}": ${message}`)
    }
  }

  return { created: urls.length, urls, errors }
}

import { useState } from 'react'
import { useAppState } from '../store'
import type { RulesFile } from '../types'
import { Plus, Trash2 } from 'lucide-react'

const getRulesTemplate = (domain: string) => `# ${domain.charAt(0).toUpperCase() + domain.slice(1)} Rules

## Overview
Rules governing Claude's behaviour when working in the ${domain} domain.

## Prescriptive Rules (Always do)
- Always follow established patterns in this domain
- Always write tests alongside implementation code
- Always use TypeScript types — no \`any\`

## Descriptive Rules (Prefer/Avoid)
- Prefer composition over inheritance
- Prefer small, focused functions over large ones
- Avoid side effects in pure utility functions

## File & Naming Conventions
- File names: kebab-case
- Component names: PascalCase
- Constants: SCREAMING_SNAKE_CASE

## Code Style
- Max line length: 100 characters
- Use arrow functions for callbacks
- Destructure props at function signature

## Domain-Specific Guidelines
<!-- Add guidelines specific to the ${domain} domain below -->
`

export default function Step5Rules() {
  const { state, dispatch } = useAppState()
  const { rules } = state

  const [newDomain, setNewDomain] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const addDomain = () => {
    const trimmed = newDomain.trim().toLowerCase()
    if (!trimmed) return
    if (rules.some(r => r.domain === trimmed)) return

    const newRule: RulesFile = {
      id: crypto.randomUUID(),
      domain: trimmed,
      content: getRulesTemplate(trimmed),
    }
    dispatch({ type: 'ADD_RULE', payload: newRule })
    setSelectedId(newRule.id)
    setNewDomain('')
  }

  const updateContent = (id: string, content: string) => {
    dispatch({ type: 'UPDATE_RULE', payload: { id, updates: { content } } })
  }

  const removeRule = (id: string) => {
    dispatch({ type: 'REMOVE_RULE', payload: id })
    if (selectedId === id) {
      const remaining = rules.filter(r => r.id !== id)
      setSelectedId(remaining[0]?.id ?? null)
    }
  }

  const selected = rules.find(r => r.id === selectedId) ?? rules[0] ?? null

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-1" style={{ color: 'var(--color-text)' }}>
          Domain Rules Files
        </h2>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Create per-domain rules files that Claude loads as context. Each file lives at{' '}
          <code className="text-xs px-1 py-0.5 rounded" style={{ backgroundColor: 'var(--color-card)' }}>
            .claude/rules/[domain].md
          </code>
        </p>
      </div>

      {/* Prescriptive vs descriptive note */}
      <div
        className="rounded-lg p-4 mb-5 text-xs leading-relaxed"
        style={{
          backgroundColor: 'rgba(99,102,241,0.08)',
          border: '1px solid rgba(99,102,241,0.25)',
          color: 'var(--color-text-muted)',
        }}
      >
        <span className="font-semibold" style={{ color: 'var(--color-accent)' }}>Tip: </span>
        Use <strong style={{ color: 'var(--color-text)' }}>prescriptive rules</strong> ("Always do X") for hard
        constraints that must never be violated. Use{' '}
        <strong style={{ color: 'var(--color-text)' }}>descriptive rules</strong> ("Prefer X over Y") for
        guidance that allows exceptions. Keep rules concise — Claude reads them every session.
      </div>

      {/* Add domain */}
      <div className="flex gap-2 mb-5">
        <input
          type="text"
          value={newDomain}
          onChange={e => setNewDomain(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addDomain()}
          placeholder="Domain name (e.g. api, components, marketing)"
          className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
          style={{
            backgroundColor: 'var(--color-card)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text)',
          }}
        />
        <button
          onClick={addDomain}
          disabled={!newDomain.trim()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all duration-150"
          style={{
            backgroundColor: newDomain.trim() ? 'var(--color-accent)' : 'var(--color-border)',
            cursor: newDomain.trim() ? 'pointer' : 'not-allowed',
          }}
        >
          <Plus size={14} /> Add Domain
        </button>
      </div>

      {rules.length === 0 ? (
        <div
          className="rounded-xl p-10 text-center"
          style={{ border: '1px dashed var(--color-border)' }}
        >
          <p className="text-sm mb-1" style={{ color: 'var(--color-text)' }}>No rule domains yet</p>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            Add domains like "api", "components", "auth" to create scoped rules files.
          </p>
        </div>
      ) : (
        <div className="flex gap-4" style={{ minHeight: '400px' }}>
          {/* Domain list */}
          <div
            className="flex-shrink-0 rounded-lg overflow-hidden"
            style={{
              width: '160px',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-card)',
            }}
          >
            {rules.map(rule => (
              <div
                key={rule.id}
                onClick={() => setSelectedId(rule.id)}
                className="flex items-center justify-between px-3 py-2.5 cursor-pointer transition-colors"
                style={{
                  backgroundColor:
                    (selectedId === rule.id || (!selectedId && rules[0].id === rule.id))
                      ? 'rgba(99,102,241,0.12)'
                      : 'transparent',
                  borderBottom: '1px solid var(--color-border)',
                }}
                onMouseEnter={e => {
                  if (selectedId !== rule.id) {
                    (e.currentTarget as HTMLDivElement).style.backgroundColor = 'rgba(255,255,255,0.04)'
                  }
                }}
                onMouseLeave={e => {
                  if (selectedId !== rule.id) {
                    (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent'
                  }
                }}
              >
                <span
                  className="text-xs font-medium truncate flex-1"
                  style={{
                    color:
                      (selectedId === rule.id || (!selectedId && rules[0].id === rule.id))
                        ? 'var(--color-accent)'
                        : 'var(--color-text)',
                  }}
                >
                  {rule.domain}
                </span>
                <button
                  onClick={e => { e.stopPropagation(); removeRule(rule.id) }}
                  className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
                  style={{ color: 'var(--color-danger)' }}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>

          {/* Editor */}
          {selected && (
            <div className="flex-1 flex flex-col min-w-0">
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-t-lg text-xs"
                style={{
                  backgroundColor: 'var(--color-sidebar)',
                  borderTop: '1px solid var(--color-border)',
                  borderLeft: '1px solid var(--color-border)',
                  borderRight: '1px solid var(--color-border)',
                  color: 'var(--color-text-muted)',
                }}
              >
                <span>.claude/rules/</span>
                <span style={{ color: 'var(--color-text)' }}>{selected.domain}.md</span>
              </div>
              <textarea
                value={selected.content}
                onChange={e => updateContent(selected.id, e.target.value)}
                className="flex-1 p-4 text-xs resize-none outline-none rounded-b-lg font-mono leading-relaxed"
                style={{
                  backgroundColor: 'var(--color-bg)',
                  border: '1px solid var(--color-border)',
                  borderTop: 'none',
                  color: 'var(--color-text)',
                  minHeight: '380px',
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

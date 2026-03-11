import { useState, useRef } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { useAppState } from '../store'
import { generateFiles } from '../lib/generateFiles'
import { validateLinearKey, createTickets } from '../lib/linearApi'
import type { LinearTeam } from '../lib/linearApi'
import { AlertCircle, Check, Rocket } from 'lucide-react'

interface FileEntry {
  path: string
  content: string
}

function checklistScore(checklist: Record<string, boolean>): number {
  return Object.values(checklist).filter(Boolean).length
}

export default function Step7Generate() {
  const { state, dispatch } = useAppState()
  const { project, mcps, skills, hooks, rules, specs, linear } = state

  const [log, setLog] = useState<string[]>([])
  const [generating, setGenerating] = useState(false)
  const [generatingTickets, setGeneratingTickets] = useState(false)
  const [generateDone, setGenerateDone] = useState(false)
  const [ticketsDone, setTicketsDone] = useState(false)
  const [teams, setTeams] = useState<LinearTeam[]>([])
  const [validatingKey, setValidatingKey] = useState(false)
  const [keyError, setKeyError] = useState('')
  const logRef = useRef<HTMLPreElement>(null)

  const appendLog = (msg: string) => {
    setLog(prev => {
      const next = [...prev, msg]
      setTimeout(() => {
        if (logRef.current) {
          logRef.current.scrollTop = logRef.current.scrollHeight
        }
      }, 50)
      return next
    })
  }

  const enabledMCPs = mcps.filter(m => m.enabled)
  const enabledHooks = hooks.filter(h => h.enabled)
  const incompleteSpecs = specs.filter(s => checklistScore(s.checklist as Record<string, boolean>) < 14)

  const updateLinear = (field: string, value: string) => {
    dispatch({ type: 'UPDATE_LINEAR', payload: { [field]: value } })
  }

  const handleFetchTeams = async () => {
    setValidatingKey(true)
    setKeyError('')
    try {
      const result = await validateLinearKey(linear.apiKey)
      if (result.valid) {
        setTeams(result.teams)
        appendLog(`✓ Linear key valid. Found ${result.teams.length} team(s).`)
      } else {
        setKeyError(result.error || 'Invalid API key')
        appendLog(`✗ Linear key validation failed: ${result.error}`)
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      setKeyError(msg)
    } finally {
      setValidatingKey(false)
    }
  }

  const handleGenerate = async () => {
    if (!project.repoPath) {
      appendLog('✗ Repository path is not set. Please complete Step 1 first.')
      return
    }

    setGenerating(true)
    setLog([])
    setGenerateDone(false)

    try {
      appendLog('Generating file contents...')
      const files = generateFiles(state)
      appendLog(`Generated ${files.length} files.`)

      const absoluteFiles: FileEntry[] = files.map(f => ({
        path: `${project.repoPath.replace(/\/$/, '')}/${f.path}`,
        content: f.content,
      }))

      appendLog('Writing files via Tauri...')
      const created = await invoke<string[]>('scaffold_project', { files: absoluteFiles })

      for (const p of created) {
        appendLog(`  ✓ ${p.replace(project.repoPath, '').replace(/^\//, '')}`)
      }

      appendLog('')
      appendLog(`✓ Done! ${created.length} files written to ${project.repoPath}`)
      setGenerateDone(true)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      appendLog(`✗ Error: ${msg}`)
    } finally {
      setGenerating(false)
    }
  }

  const handleCreateTickets = async () => {
    if (!linear.apiKey || !linear.teamId) {
      appendLog('✗ Linear API key and Team ID are required.')
      return
    }

    setGeneratingTickets(true)
    setTicketsDone(false)

    try {
      appendLog('Creating Linear tickets...')
      const result = await createTickets(linear, specs, project.name)

      for (const url of result.urls) {
        appendLog(`  ✓ ${url}`)
      }

      for (const err of result.errors) {
        appendLog(`  ✗ ${err}`)
      }

      appendLog('')
      appendLog(`✓ Created ${result.created} Linear ticket(s).`)
      setTicketsDone(true)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      appendLog(`✗ Error: ${msg}`)
    } finally {
      setGeneratingTickets(false)
    }
  }

  const inputClass = "w-full px-3 py-2 rounded-lg text-sm outline-none"
  const inputStyle = {
    backgroundColor: 'var(--color-bg)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text)',
  }
  const selectClass = `${inputClass} app-select`
  const labelStyle = { color: 'var(--color-text-muted)' }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold mb-1" style={{ color: 'var(--color-text)' }}>
          Generate
        </h2>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Write all configuration files to disk and optionally create Linear tickets.
        </p>
      </div>

      {/* Linear config card */}
      <div
        className="rounded-xl p-5"
        style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)' }}
      >
        <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
          Linear Setup <span className="text-xs font-normal" style={{ color: 'var(--color-text-muted)' }}>(optional)</span>
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1" style={labelStyle}>
              Linear API Key
            </label>
            <div className="flex gap-2">
              <input
                type="password"
                value={linear.apiKey}
                onChange={e => updateLinear('apiKey', e.target.value)}
                placeholder="lin_api_..."
                className={`${inputClass} flex-1 font-mono`}
                style={inputStyle}
              />
              <button
                onClick={handleFetchTeams}
                disabled={!linear.apiKey || validatingKey}
                className="px-3 py-2 rounded-lg text-xs font-medium transition-colors shrink-0"
                style={{
                  backgroundColor: linear.apiKey && !validatingKey ? 'var(--color-accent)' : 'var(--color-border)',
                  color: 'white',
                  cursor: linear.apiKey && !validatingKey ? 'pointer' : 'not-allowed',
                }}
              >
                {validatingKey ? 'Checking...' : 'Fetch Teams'}
              </button>
            </div>
            {keyError && (
              <p className="text-xs mt-1 flex items-center gap-1" style={{ color: 'var(--color-danger)' }}>
                <AlertCircle size={11} /> {keyError}
              </p>
            )}
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
              Your API key is never written to disk. It is only used to create tickets.
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1" style={labelStyle}>Team ID</label>
            {teams.length > 0 ? (
              <select
                value={linear.teamId}
                onChange={e => updateLinear('teamId', e.target.value)}
                className={selectClass}
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                <option value="" style={{ backgroundColor: 'var(--color-card)' }}>Select a team...</option>
                {teams.map(t => (
                  <option key={t.id} value={t.id} style={{ backgroundColor: 'var(--color-card)' }}>
                    {t.name} ({t.id})
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={linear.teamId}
                onChange={e => updateLinear('teamId', e.target.value)}
                placeholder="team_xxx or fetch teams above"
                className={inputClass}
                style={inputStyle}
              />
            )}
          </div>

          <div>
            <label className="block text-xs font-medium mb-1" style={labelStyle}>
              Project ID <span className="font-normal" style={{ color: 'var(--color-text-muted)' }}>(optional)</span>
            </label>
            <input
              type="text"
              value={linear.projectId}
              onChange={e => updateLinear('projectId', e.target.value)}
              placeholder="project_xxx (optional)"
              className={inputClass}
              style={inputStyle}
            />
          </div>
        </div>
      </div>

      {/* Summary card */}
      <div
        className="rounded-xl p-5"
        style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)' }}
      >
        <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
          Summary
        </h3>

        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { label: 'MCPs', value: enabledMCPs.length, total: mcps.length },
            { label: 'Skills', value: skills.length, total: null },
            { label: 'Hooks', value: enabledHooks.length, total: hooks.length },
            { label: 'Rule Domains', value: rules.length, total: null },
            { label: 'Specs', value: specs.length, total: null },
            { label: 'Incomplete Specs', value: incompleteSpecs.length, total: null, warn: incompleteSpecs.length > 0 },
          ].map(item => (
            <div
              key={item.label}
              className="rounded-lg p-3 text-center"
              style={{
                backgroundColor: 'var(--color-bg)',
                border: `1px solid ${item.warn ? 'rgba(245,158,11,0.3)' : 'var(--color-border)'}`,
              }}
            >
              <div
                className="text-2xl font-bold"
                style={{ color: item.warn ? 'var(--color-warning)' : 'var(--color-accent)' }}
              >
                {item.value}
                {item.total !== null && (
                  <span className="text-xs font-normal ml-1" style={{ color: 'var(--color-text-muted)' }}>
                    /{item.total}
                  </span>
                )}
              </div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                {item.label}
              </div>
            </div>
          ))}
        </div>

        {incompleteSpecs.length > 0 && (
          <div
            className="flex items-start gap-2 px-3 py-2 rounded-lg text-xs mb-4"
            style={{
              backgroundColor: 'rgba(245,158,11,0.1)',
              border: '1px solid rgba(245,158,11,0.3)',
              color: 'var(--color-warning)',
            }}
          >
            <AlertCircle size={13} className="shrink-0 mt-0.5" />
            <span>
              {incompleteSpecs.map(s => s.featureName || 'Untitled').join(', ')} {incompleteSpecs.length === 1 ? 'is' : 'are'} incomplete.
              You can still generate, but review the checklist for best results.
            </span>
          </div>
        )}

        {!project.repoPath && (
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs mb-4"
            style={{
              backgroundColor: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              color: 'var(--color-danger)',
            }}
          >
            <AlertCircle size={13} />
            Repository path not set. Go to Step 1 to set it before generating.
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleGenerate}
            disabled={generating || !project.repoPath}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-all duration-150"
            style={{
              backgroundColor: generating || !project.repoPath ? 'var(--color-border)' : 'var(--color-accent)',
              cursor: generating || !project.repoPath ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={e => {
              if (!generating && project.repoPath) {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-accent-hover)'
              }
            }}
            onMouseLeave={e => {
              if (!generating && project.repoPath) {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-accent)'
              }
            }}
          >
            <Rocket size={14} />
            {generating ? 'Generating...' : 'Generate Project Files'}
          </button>

          <button
            onClick={handleCreateTickets}
            disabled={generatingTickets || specs.length === 0 || !linear.apiKey || !linear.teamId}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150"
            style={{
              backgroundColor: 'transparent',
              border: '1px solid var(--color-border)',
              color:
                generatingTickets || specs.length === 0 || !linear.apiKey || !linear.teamId
                  ? 'var(--color-text-muted)'
                  : 'var(--color-text)',
              cursor:
                generatingTickets || specs.length === 0 || !linear.apiKey || !linear.teamId
                  ? 'not-allowed'
                  : 'pointer',
            }}
            onMouseEnter={e => {
              if (!generatingTickets && specs.length > 0 && linear.apiKey && linear.teamId) {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-accent)'
              }
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-border)'
            }}
          >
            {generatingTickets ? 'Creating...' : 'Create Linear Tickets'}
          </button>
        </div>
      </div>

      {/* Status log */}
      {log.length > 0 && (
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: '1px solid var(--color-border)' }}
        >
          <div
            className="flex items-center gap-2 px-4 py-2.5"
            style={{ backgroundColor: 'var(--color-sidebar)', borderBottom: '1px solid var(--color-border)' }}
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: generating || generatingTickets ? '#f59e0b' : generateDone || ticketsDone ? 'var(--color-success)' : 'var(--color-text-muted)' }}
            />
            <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
              Output log
            </span>
          </div>
          <pre
            ref={logRef}
            className="p-4 text-xs overflow-auto font-mono leading-relaxed"
            style={{
              backgroundColor: 'var(--color-bg)',
              color: 'var(--color-text-muted)',
              maxHeight: '280px',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {log.join('\n')}
          </pre>
        </div>
      )}

      {/* Success states */}
      {generateDone && (
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm"
          style={{
            backgroundColor: 'rgba(34,197,94,0.1)',
            border: '1px solid rgba(34,197,94,0.3)',
            color: 'var(--color-success)',
          }}
        >
          <Check size={16} />
          <div>
            <p className="font-semibold">Project files generated successfully!</p>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(34,197,94,0.7)' }}>
              Files written to <code className="font-mono">{project.repoPath}</code>
            </p>
          </div>
        </div>
      )}

      {ticketsDone && (
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm"
          style={{
            backgroundColor: 'rgba(34,197,94,0.1)',
            border: '1px solid rgba(34,197,94,0.3)',
            color: 'var(--color-success)',
          }}
        >
          <Check size={16} />
          <p className="font-semibold">Linear tickets created successfully!</p>
        </div>
      )}
    </div>
  )
}

import { useAppState } from '../store'
import type { MCPServer } from '../types'

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="relative inline-flex items-center rounded-full transition-colors duration-200 flex-shrink-0"
      style={{
        width: '40px',
        height: '22px',
        backgroundColor: enabled ? 'var(--color-accent)' : 'var(--color-border)',
      }}
    >
      <span
        className="inline-block rounded-full bg-white transition-transform duration-200"
        style={{
          width: '16px',
          height: '16px',
          transform: enabled ? 'translateX(21px)' : 'translateX(3px)',
        }}
      />
    </button>
  )
}

function MCPCard({ mcp }: { mcp: MCPServer }) {
  const { dispatch } = useAppState()

  const toggle = () => {
    dispatch({ type: 'UPDATE_MCP', payload: { id: mcp.id, updates: { enabled: !mcp.enabled } } })
  }

  const updateEnvVar = (key: string, value: string) => {
    const newEnvVars = mcp.envVars.map(ev => ev.key === key ? { ...ev, value } : ev)
    dispatch({ type: 'UPDATE_MCP', payload: { id: mcp.id, updates: { envVars: newEnvVars } } })
  }

  return (
    <div
      className="rounded-lg p-4 transition-all duration-150"
      style={{
        backgroundColor: 'var(--color-card)',
        border: `1px solid ${mcp.enabled ? 'var(--color-accent)' : 'var(--color-border)'}`,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
              {mcp.name}
            </span>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{
                backgroundColor: 'rgba(99,102,241,0.15)',
                color: 'var(--color-accent)',
              }}
            >
              {mcp.service}
            </span>
          </div>
          <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
            {mcp.purpose}
          </p>
          <code
            className="text-xs mt-1.5 block"
            style={{ color: 'var(--color-text-muted)', fontFamily: 'monospace' }}
          >
            {mcp.npmPackage}
          </code>
        </div>
        <Toggle enabled={mcp.enabled} onToggle={toggle} />
      </div>

      {/* Env vars shown when enabled */}
      {mcp.enabled && mcp.envVars.length > 0 && (
        <div className="mt-4 space-y-3 pt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
          {mcp.envVars.map(ev => (
            <div key={ev.key}>
              <label
                className="block text-xs font-medium mb-1"
                style={{ color: 'var(--color-text-muted)' }}
              >
                {ev.label}
              </label>
              <input
                type="password"
                value={ev.value}
                onChange={e => updateEnvVar(ev.key, e.target.value)}
                placeholder={ev.placeholder}
                className="w-full px-3 py-1.5 rounded-md text-sm outline-none"
                style={{
                  backgroundColor: 'var(--color-bg)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text)',
                  fontFamily: 'monospace',
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Step2MCPs() {
  const { state } = useAppState()
  const { mcps } = state

  const adoptMCPs = mcps.filter(m => m.tier === 'adopt')
  const evaluateMCPs = mcps.filter(m => m.tier === 'evaluate')
  const enabledMCPs = mcps.filter(m => m.enabled)

  const previewConfig = {
    mcpServers: Object.fromEntries(
      enabledMCPs.map(m => {
        const envObj: Record<string, string> = {}
        m.envVars.forEach(ev => { if (ev.value) envObj[ev.key] = ev.value })
        return [
          m.configKey,
          {
            command: 'npx',
            args: ['-y', m.npmPackage, ...m.args],
            ...(Object.keys(envObj).length > 0 ? { env: envObj } : {}),
          },
        ]
      })
    ),
  }

  const sectionTitle = (title: string, subtitle: string) => (
    <div className="mb-3">
      <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{title}</h3>
      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{subtitle}</p>
    </div>
  )

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-1" style={{ color: 'var(--color-text)' }}>
          MCP Servers
        </h2>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Select Model Context Protocol servers to include in your Claude Code configuration.
          Enable an MCP to configure its credentials.
        </p>
      </div>

      {/* Adopt section */}
      <div className="mb-6">
        {sectionTitle('Adopt Now', 'Battle-tested servers recommended for most projects')}
        <div className="space-y-3">
          {adoptMCPs.map(mcp => <MCPCard key={mcp.id} mcp={mcp} />)}
        </div>
      </div>

      {/* Evaluate section */}
      <div className="mb-6">
        {sectionTitle('Evaluate', 'Useful for specific use cases — worth trialling')}
        <div className="space-y-3">
          {evaluateMCPs.map(mcp => <MCPCard key={mcp.id} mcp={mcp} />)}
        </div>
      </div>

      {/* JSON Preview */}
      {enabledMCPs.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div
              className="text-xs font-medium px-2 py-0.5 rounded"
              style={{ backgroundColor: 'var(--color-sidebar)', color: 'var(--color-text-muted)' }}
            >
              Preview
            </div>
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              .claude/claude.json
            </span>
          </div>
          <pre
            className="rounded-lg p-4 text-xs overflow-auto"
            style={{
              backgroundColor: 'var(--color-bg)',
              border: '1px solid var(--color-border)',
              color: '#7ee787',
              fontFamily: 'monospace',
              maxHeight: '280px',
            }}
          >
            {JSON.stringify(previewConfig, null, 2)}
          </pre>
        </div>
      )}

      {enabledMCPs.length === 0 && (
        <p className="text-xs mt-2" style={{ color: 'var(--color-text-muted)' }}>
          Enable at least one MCP to see the configuration preview.
        </p>
      )}
    </div>
  )
}

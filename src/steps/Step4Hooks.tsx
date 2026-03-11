import { useState } from 'react'
import { useAppState } from '../store'
import type { Hook } from '../types'
import { Plus, Trash2 } from 'lucide-react'

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="relative inline-flex items-center rounded-full transition-colors duration-200 shrink-0"
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

const triggerColors: Record<string, string> = {
  PostToolUse: '#22c55e',
  Stop: '#f59e0b',
  PreToolUse: '#6366f1',
}

export default function Step4Hooks() {
  const { state, dispatch } = useAppState()
  const { hooks } = state

  const [showForm, setShowForm] = useState(false)
  const [newHook, setNewHook] = useState<Omit<Hook, 'id'>>({
    name: '',
    trigger: 'PostToolUse',
    matcher: '',
    command: '',
    purpose: '',
    enabled: true,
  })

  const toggleHook = (id: string) => {
    const hook = hooks.find(h => h.id === id)
    if (hook) {
      dispatch({ type: 'UPDATE_HOOK', payload: { id, updates: { enabled: !hook.enabled } } })
    }
  }

  const removeHook = (id: string) => {
    dispatch({ type: 'REMOVE_HOOK', payload: id })
  }

  const addCustomHook = () => {
    if (!newHook.name || !newHook.command) return
    dispatch({
      type: 'ADD_HOOK',
      payload: { ...newHook, id: crypto.randomUUID() },
    })
    setNewHook({ name: '', trigger: 'PostToolUse', matcher: '', command: '', purpose: '', enabled: true })
    setShowForm(false)
  }

  const enabledHooks = hooks.filter(h => h.enabled)

  // Build hooks JSON preview
  const hooksConfig = {
    hooks: {
      PostToolUse: enabledHooks
        .filter(h => h.trigger === 'PostToolUse')
        .map(h => ({ matcher: h.matcher, hooks: [{ type: 'command', command: h.command }] })),
      Stop: enabledHooks
        .filter(h => h.trigger === 'Stop')
        .map(h => ({ hooks: [{ type: 'command', command: h.command }] })),
      PreToolUse: enabledHooks
        .filter(h => h.trigger === 'PreToolUse')
        .map(h => ({ matcher: h.matcher, hooks: [{ type: 'command', command: h.command }] })),
    },
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
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-1" style={{ color: 'var(--color-text)' }}>
          Claude Code Hooks
        </h2>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Hooks run shell commands automatically at certain points in Claude's workflow.
          Toggle presets on and add custom hooks below.
        </p>
      </div>

      {/* Hook cards */}
      <div className="space-y-3 mb-5">
        {hooks.map(hook => (
          <div
            key={hook.id}
            className="rounded-lg p-4 transition-all duration-150"
            style={{
              backgroundColor: 'var(--color-card)',
              border: `1px solid ${hook.enabled ? 'var(--color-accent)' : 'var(--color-border)'}`,
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                    {hook.name}
                  </span>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{
                      backgroundColor: `${triggerColors[hook.trigger]}20`,
                      color: triggerColors[hook.trigger],
                    }}
                  >
                    {hook.trigger}
                  </span>
                  {hook.matcher && (
                    <span
                      className="text-xs px-2 py-0.5 rounded font-mono"
                      style={{ backgroundColor: 'var(--color-sidebar)', color: 'var(--color-text-muted)' }}
                    >
                      {hook.matcher}
                    </span>
                  )}
                </div>
                <p className="text-xs mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
                  {hook.purpose}
                </p>
                <code
                  className="text-xs px-2 py-1 rounded block"
                  style={{
                    backgroundColor: 'var(--color-bg)',
                    color: '#7ee787',
                    fontFamily: 'monospace',
                  }}
                >
                  {hook.command}
                </code>
              </div>
              <div className="flex items-center gap-2">
                <Toggle enabled={hook.enabled} onToggle={() => toggleHook(hook.id)} />
                <button
                  onClick={() => removeHook(hook.id)}
                  className="p-1 rounded transition-colors"
                  style={{ color: 'var(--color-danger)' }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add custom hook */}
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium mb-6 transition-all duration-150"
          style={{
            backgroundColor: 'var(--color-card)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text)',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-accent)'
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-border)'
          }}
        >
          <Plus size={14} /> Add Custom Hook
        </button>
      ) : (
        <div
          className="rounded-xl p-5 mb-6 space-y-4"
          style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)' }}
        >
          <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
            New Custom Hook
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1" style={labelStyle}>Name</label>
              <input
                type="text"
                value={newHook.name}
                onChange={e => setNewHook(h => ({ ...h, name: e.target.value }))}
                placeholder="My custom hook"
                className={selectClass}
                style={inputStyle}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={labelStyle}>Trigger</label>
              <select
                value={newHook.trigger}
                onChange={e => setNewHook(h => ({ ...h, trigger: e.target.value as Hook['trigger'] }))}
                className={inputClass}
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                <option value="PostToolUse" style={{ backgroundColor: 'var(--color-card)' }}>PostToolUse</option>
                <option value="Stop" style={{ backgroundColor: 'var(--color-card)' }}>Stop</option>
                <option value="PreToolUse" style={{ backgroundColor: 'var(--color-card)' }}>PreToolUse</option>
              </select>
            </div>
          </div>

          {newHook.trigger !== 'Stop' && (
            <div>
              <label className="block text-xs font-medium mb-1" style={labelStyle}>Matcher (regex)</label>
              <input
                type="text"
                value={newHook.matcher}
                onChange={e => setNewHook(h => ({ ...h, matcher: e.target.value }))}
                placeholder="Edit|Write"
                className={inputClass}
                style={inputStyle}
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium mb-1" style={labelStyle}>Command</label>
            <input
              type="text"
              value={newHook.command}
              onChange={e => setNewHook(h => ({ ...h, command: e.target.value }))}
              placeholder="npx tsc --noEmit"
              className={`${inputClass} font-mono`}
              style={inputStyle}
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1" style={labelStyle}>Purpose</label>
            <input
              type="text"
              value={newHook.purpose}
              onChange={e => setNewHook(h => ({ ...h, purpose: e.target.value }))}
              placeholder="What does this hook do?"
              className={inputClass}
              style={inputStyle}
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={addCustomHook}
              disabled={!newHook.name || !newHook.command}
              className="px-4 py-2 text-sm font-medium rounded-lg text-white transition-colors"
              style={{
                backgroundColor: newHook.name && newHook.command ? 'var(--color-accent)' : 'var(--color-border)',
                cursor: newHook.name && newHook.command ? 'pointer' : 'not-allowed',
              }}
            >
              Add Hook
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
              style={{ color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* JSON Preview */}
      {enabledHooks.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div
              className="text-xs font-medium px-2 py-0.5 rounded"
              style={{ backgroundColor: 'var(--color-sidebar)', color: 'var(--color-text-muted)' }}
            >
              Preview
            </div>
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              .claude/settings.json (hooks section)
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
            {JSON.stringify(hooksConfig, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}

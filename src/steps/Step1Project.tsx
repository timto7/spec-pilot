import { useAppState } from '../store'
import { invoke } from '@tauri-apps/api/core'
import { FolderOpen } from 'lucide-react'
import type { Framework, PackageManager } from '../types'

export default function Step1Project() {
  const { state, dispatch } = useAppState()
  const { project } = state

  const update = (field: string, value: string) => {
    dispatch({ type: 'UPDATE_PROJECT', payload: { [field]: value } })
  }

  const handleBrowse = async () => {
    try {
      const result = await invoke<string | null>('open_directory_dialog')
      if (result) update('repoPath', result)
    } catch (err) {
      console.warn('Directory dialog not available:', err)
    }
  }

  const inputClass = "w-full px-3 py-2 rounded-lg text-sm outline-none transition-all duration-150"
  const inputStyle = {
    backgroundColor: 'var(--color-bg)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text)',
  }
  const selectClass = `${inputClass} app-select`
  const labelClass = "block text-xs font-medium mb-1.5"
  const labelStyle = { color: 'var(--color-text-muted)' }

  const frameworks: (Framework | '')[] = ['', 'Next.js', 'Remix', 'Vite React', 'SvelteKit', 'Nuxt', 'Other']
  const packageManagers: PackageManager[] = ['bun', 'npm', 'yarn', 'pnpm']

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-1" style={{ color: 'var(--color-text)' }}>
          Define your project
        </h2>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Basic information about the project this configuration will be generated for.
        </p>
      </div>

      <div
        className="rounded-xl p-6 space-y-5"
        style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)' }}
      >
        {/* Project Name */}
        <div>
          <label className={labelClass} style={labelStyle}>
            Project Name <span style={{ color: 'var(--color-danger)' }}>*</span>
          </label>
          <input
            type="text"
            value={project.name}
            onChange={e => update('name', e.target.value)}
            placeholder="my-awesome-app"
            className={inputClass}
            style={inputStyle}
          />
        </div>

        {/* Repository Path */}
        <div>
          <label className={labelClass} style={labelStyle}>
            Repository Path <span style={{ color: 'var(--color-danger)' }}>*</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={project.repoPath}
              onChange={e => update('repoPath', e.target.value)}
              placeholder="/Users/you/Developer/my-awesome-app"
              className={`${inputClass} flex-1`}
              style={inputStyle}
            />
            <button
              onClick={handleBrowse}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium shrink-0 transition-all duration-150"
              style={{
                backgroundColor: 'var(--color-sidebar)',
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
              <FolderOpen size={14} />
              Browse
            </button>
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Absolute path to your project root. All generated files will be written here.
          </p>
        </div>

        {/* Framework + Package Manager */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass} style={labelStyle}>Framework</label>
            <select
              value={project.framework}
              onChange={e => update('framework', e.target.value)}
              className={selectClass}
              style={{ ...inputStyle, cursor: 'pointer' }}
            >
              {frameworks.map(f => (
                <option key={f} value={f} style={{ backgroundColor: 'var(--color-card)' }}>
                  {f || 'Select framework...'}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass} style={labelStyle}>Package Manager</label>
            <select
              value={project.packageManager}
              onChange={e => update('packageManager', e.target.value as PackageManager)}
              className={selectClass}
              style={{ ...inputStyle, cursor: 'pointer' }}
            >
              {packageManagers.map(pm => (
                <option key={pm} value={pm} style={{ backgroundColor: 'var(--color-card)' }}>
                  {pm}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Language + Deploy Target */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass} style={labelStyle}>Language</label>
            <select
              value={project.language}
              onChange={e => update('language', e.target.value as 'TypeScript' | 'JavaScript')}
              className={selectClass}
              style={{ ...inputStyle, cursor: 'pointer' }}
            >
              <option value="TypeScript" style={{ backgroundColor: 'var(--color-card)' }}>TypeScript</option>
              <option value="JavaScript" style={{ backgroundColor: 'var(--color-card)' }}>JavaScript</option>
            </select>
          </div>
          <div>
            <label className={labelClass} style={labelStyle}>Deploy Target</label>
            <input
              type="text"
              value={project.deployTarget}
              onChange={e => update('deployTarget', e.target.value)}
              placeholder="Vercel, AWS, Fly.io..."
              className={inputClass}
              style={inputStyle}
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className={labelClass} style={labelStyle}>Description</label>
          <textarea
            value={project.description}
            onChange={e => update('description', e.target.value)}
            placeholder="Brief description of what this project does..."
            rows={3}
            className={`${inputClass} resize-none`}
            style={inputStyle}
          />
        </div>
      </div>

      {/* Validation hint */}
      {(!project.name || !project.repoPath) && (
        <p className="mt-3 text-xs flex items-center gap-1.5" style={{ color: 'var(--color-warning)' }}>
          <span>⚠</span> Project Name and Repository Path are required to continue.
        </p>
      )}
    </div>
  )
}

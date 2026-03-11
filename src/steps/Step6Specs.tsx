import { useState } from 'react'
import { useAppState } from '../store'
import type { Spec, SpecSection, SpecAsset, SpecChecklist } from '../types'
import { Plus, Trash2, AlertCircle, Check } from 'lucide-react'

const defaultChecklist = (): SpecChecklist => ({
  purposeStated: false,
  componentsNamed: false,
  copyFinalised: false,
  dataSourcesIdentified: false,
  assetsSpecified: false,
  visualLayoutDescribed: false,
  responsiveBehaviour: false,
  interactiveStates: false,
  linksHaveDestinations: false,
  acceptanceCriteria: false,
  performanceTargets: false,
  accessibilityRequirements: false,
  seoMetadata: false,
  dependenciesListed: false,
})

const newSpec = (): Spec => ({
  id: crypto.randomUUID(),
  featureName: '',
  domain: '',
  overview: '',
  inScope: [''],
  outOfScope: [],
  sections: [],
  assets: [],
  acceptanceCriteria: [''],
  constraints: [],
  dependsOn: [],
  blocks: [],
  checklist: defaultChecklist(),
})

const newSection = (): SpecSection => ({
  id: crypto.randomUUID(),
  name: '',
  purpose: '',
  layout: '',
  content: '',
  assets: '',
  states: '',
  breakpoints: '',
})

const newAsset = (): SpecAsset => ({
  id: crypto.randomUUID(),
  name: '',
  path: '',
  dimensions: '',
  format: '',
  altText: '',
})

const CHECKLIST_LABELS: Record<keyof SpecChecklist, string> = {
  purposeStated: 'Purpose is clearly stated',
  componentsNamed: 'All components are named',
  copyFinalised: 'Copy / text content is finalised',
  dataSourcesIdentified: 'Data sources are identified',
  assetsSpecified: 'All assets are specified',
  visualLayoutDescribed: 'Visual layout is described',
  responsiveBehaviour: 'Responsive behaviour is documented',
  interactiveStates: 'Interactive states are documented',
  linksHaveDestinations: 'All links have destinations',
  acceptanceCriteria: 'Acceptance criteria written',
  performanceTargets: 'Performance targets defined',
  accessibilityRequirements: 'Accessibility requirements specified',
  seoMetadata: 'SEO metadata defined',
  dependenciesListed: 'Dependencies and blocks listed',
}

function checklistScore(checklist: SpecChecklist): number {
  return Object.values(checklist).filter(Boolean).length
}

function DynamicList({
  items,
  placeholder,
  onChange,
}: {
  items: string[]
  placeholder: string
  onChange: (items: string[]) => void
}) {
  const update = (i: number, v: string) => {
    const next = [...items]
    next[i] = v
    onChange(next)
  }
  const add = () => onChange([...items, ''])
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i))

  const inputStyle = {
    backgroundColor: 'var(--color-bg)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text)',
  }

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex gap-2 items-center">
          <input
            type="text"
            value={item}
            onChange={e => update(i, e.target.value)}
            placeholder={placeholder}
            className="flex-1 px-3 py-1.5 rounded-lg text-xs outline-none"
            style={inputStyle}
          />
          <button onClick={() => remove(i)} style={{ color: 'var(--color-danger)' }}>
            <Trash2 size={13} />
          </button>
        </div>
      ))}
      <button
        onClick={add}
        className="flex items-center gap-1 text-xs px-2 py-1 rounded"
        style={{
          backgroundColor: 'var(--color-sidebar)',
          color: 'var(--color-accent)',
          border: '1px solid var(--color-border)',
        }}
      >
        <Plus size={10} /> Add
      </button>
    </div>
  )
}

function SectionEditor({
  section,
  onUpdate,
  onDelete,
}: {
  section: SpecSection
  onUpdate: (updates: Partial<SpecSection>) => void
  onDelete: () => void
}) {
  const [open, setOpen] = useState(true)
  const inputStyle = {
    backgroundColor: 'var(--color-bg)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text)',
  }
  const labelStyle = { color: 'var(--color-text-muted)' }
  const inputClass = "w-full px-3 py-1.5 rounded-lg text-xs outline-none"

  return (
    <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
      <div
        className="flex items-center justify-between px-3 py-2 cursor-pointer"
        style={{ backgroundColor: 'var(--color-sidebar)' }}
        onClick={() => setOpen(o => !o)}
      >
        <span className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>
          {section.name || 'New Section'}
        </span>
        <button
          onClick={e => { e.stopPropagation(); onDelete() }}
          style={{ color: 'var(--color-danger)' }}
        >
          <Trash2 size={12} />
        </button>
      </div>
      {open && (
        <div className="p-3 grid grid-cols-2 gap-3">
          {([
            ['name', 'Section Name', 'Hero', false],
            ['purpose', 'Purpose', 'What this section achieves', false],
            ['layout', 'Layout', 'Full-width, 2-col grid...', false],
            ['content', 'Content', 'Describe the content...', true],
            ['assets', 'Assets', 'hero-image.webp 1200x600', false],
            ['states', 'States', 'default, hover, loading, empty', false],
            ['breakpoints', 'Breakpoints', 'mobile: stack cols, tablet: 2-col', false],
          ] as [keyof SpecSection, string, string, boolean][]).map(([field, label, placeholder, multi]) => (
            <div key={field} className={multi ? 'col-span-2' : ''}>
              <label className="block text-xs font-medium mb-1" style={labelStyle}>{label}</label>
              {multi ? (
                <textarea
                  value={section[field] as string}
                  onChange={e => onUpdate({ [field]: e.target.value })}
                  placeholder={placeholder}
                  rows={2}
                  className={`${inputClass} resize-none`}
                  style={inputStyle}
                />
              ) : (
                <input
                  type="text"
                  value={section[field] as string}
                  onChange={e => onUpdate({ [field]: e.target.value })}
                  placeholder={placeholder}
                  className={inputClass}
                  style={inputStyle}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function SpecEditor({ spec }: { spec: Spec }) {
  const { dispatch } = useAppState()
  const update = (updates: Partial<Spec>) => {
    dispatch({ type: 'UPDATE_SPEC', payload: { id: spec.id, updates } })
  }

  const inputStyle = {
    backgroundColor: 'var(--color-bg)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text)',
  }
  const labelStyle = { color: 'var(--color-text-muted)' }
  const inputClass = "w-full px-3 py-2 rounded-lg text-sm outline-none"
  const sectionTitle = (title: string) => (
    <h4
      className="text-xs font-semibold uppercase tracking-wider mb-3 mt-5 first:mt-0"
      style={{ color: 'var(--color-text-muted)' }}
    >
      {title}
    </h4>
  )

  const addSection = () => update({ sections: [...spec.sections, newSection()] })
  const updateSection = (id: string, updates: Partial<SpecSection>) => {
    update({ sections: spec.sections.map(s => s.id === id ? { ...s, ...updates } : s) })
  }
  const removeSection = (id: string) => {
    update({ sections: spec.sections.filter(s => s.id !== id) })
  }

  const addAsset = () => update({ assets: [...spec.assets, newAsset()] })
  const removeAsset = (id: string) => update({ assets: spec.assets.filter(a => a.id !== id) })
  const updateAsset = (id: string, field: keyof SpecAsset, value: string) => {
    update({ assets: spec.assets.map(a => a.id === id ? { ...a, [field]: value } : a) })
  }

  const toggleChecklist = (key: keyof SpecChecklist) => {
    update({ checklist: { ...spec.checklist, [key]: !spec.checklist[key] } })
  }

  const score = checklistScore(spec.checklist)

  return (
    <div className="overflow-y-auto flex-1 px-1">
      {/* Basic info */}
      {sectionTitle('Basic Info')}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-xs font-medium mb-1" style={labelStyle}>Feature Name</label>
          <input
            type="text"
            value={spec.featureName}
            onChange={e => update({ featureName: e.target.value })}
            placeholder="User Onboarding Flow"
            className={inputClass}
            style={inputStyle}
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1" style={labelStyle}>Domain</label>
          <input
            type="text"
            value={spec.domain}
            onChange={e => update({ domain: e.target.value })}
            placeholder="auth, marketing, dashboard..."
            className={inputClass}
            style={inputStyle}
          />
        </div>
      </div>
      <div className="mb-4">
        <label className="block text-xs font-medium mb-1" style={labelStyle}>Overview</label>
        <textarea
          value={spec.overview}
          onChange={e => update({ overview: e.target.value })}
          placeholder="High-level description of what this feature does and why..."
          rows={3}
          className={`${inputClass} resize-none`}
          style={inputStyle}
        />
      </div>

      {/* Scope */}
      {sectionTitle('Scope')}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs font-medium mb-2" style={labelStyle}>In Scope</label>
          <DynamicList
            items={spec.inScope}
            placeholder="Feature or behaviour included..."
            onChange={inScope => update({ inScope })}
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-2" style={labelStyle}>Out of Scope</label>
          <DynamicList
            items={spec.outOfScope}
            placeholder="Explicitly excluded..."
            onChange={outOfScope => update({ outOfScope })}
          />
        </div>
      </div>

      {/* Sections */}
      {sectionTitle('Page / UI Sections')}
      <div className="space-y-2 mb-3">
        {spec.sections.map(section => (
          <SectionEditor
            key={section.id}
            section={section}
            onUpdate={updates => updateSection(section.id, updates)}
            onDelete={() => removeSection(section.id)}
          />
        ))}
      </div>
      <button
        onClick={addSection}
        className="flex items-center gap-1 text-xs px-3 py-1.5 rounded mb-5"
        style={{
          backgroundColor: 'var(--color-sidebar)',
          color: 'var(--color-accent)',
          border: '1px solid var(--color-border)',
        }}
      >
        <Plus size={11} /> Add Section
      </button>

      {/* Assets table */}
      {sectionTitle('Assets')}
      {spec.assets.length > 0 && (
        <div className="mb-2 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                {['Name', 'Path', 'Dimensions', 'Format', 'Alt Text', ''].map(h => (
                  <th
                    key={h}
                    className="text-left pb-2 pr-2 font-medium"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {spec.assets.map(asset => (
                <tr key={asset.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  {(['name', 'path', 'dimensions', 'format', 'altText'] as (keyof SpecAsset)[]).map(field => (
                    <td key={field} className="py-1.5 pr-2">
                      <input
                        type="text"
                        value={asset[field] as string}
                        onChange={e => updateAsset(asset.id, field, e.target.value)}
                        placeholder={field}
                        className="w-full px-2 py-1 rounded text-xs outline-none"
                        style={inputStyle}
                      />
                    </td>
                  ))}
                  <td className="py-1.5">
                    <button onClick={() => removeAsset(asset.id)} style={{ color: 'var(--color-danger)' }}>
                      <Trash2 size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <button
        onClick={addAsset}
        className="flex items-center gap-1 text-xs px-3 py-1.5 rounded mb-5"
        style={{
          backgroundColor: 'var(--color-sidebar)',
          color: 'var(--color-accent)',
          border: '1px solid var(--color-border)',
        }}
      >
        <Plus size={11} /> Add Asset
      </button>

      {/* Acceptance criteria / Constraints / Dependencies */}
      {sectionTitle('Acceptance Criteria')}
      <div className="mb-4">
        <DynamicList
          items={spec.acceptanceCriteria}
          placeholder="Given... When... Then..."
          onChange={acceptanceCriteria => update({ acceptanceCriteria })}
        />
      </div>

      {sectionTitle('Constraints')}
      <div className="mb-4">
        <DynamicList
          items={spec.constraints}
          placeholder="Technical or business constraint..."
          onChange={constraints => update({ constraints })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-5">
        <div>
          {sectionTitle('Depends On')}
          <DynamicList
            items={spec.dependsOn}
            placeholder="spec or feature name..."
            onChange={dependsOn => update({ dependsOn })}
          />
        </div>
        <div>
          {sectionTitle('Blocks')}
          <DynamicList
            items={spec.blocks}
            placeholder="spec or feature name..."
            onChange={blocks => update({ blocks })}
          />
        </div>
      </div>

      {/* Checklist */}
      <div
        className="rounded-xl p-4"
        style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)' }}
      >
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
            Completeness Checklist
          </h4>
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-medium"
              style={{ color: score === 14 ? 'var(--color-success)' : 'var(--color-warning)' }}
            >
              {score}/14
            </span>
            {score < 14 && <AlertCircle size={13} style={{ color: 'var(--color-warning)' }} />}
            {score === 14 && <Check size={13} style={{ color: 'var(--color-success)' }} />}
          </div>
        </div>

        {/* Progress bar */}
        <div
          className="w-full h-1.5 rounded-full mb-4"
          style={{ backgroundColor: 'var(--color-border)' }}
        >
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${(score / 14) * 100}%`,
              backgroundColor: score === 14 ? 'var(--color-success)' : 'var(--color-accent)',
            }}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(CHECKLIST_LABELS) as (keyof SpecChecklist)[]).map(key => {
            const checked = spec.checklist[key]
            return (
              <label
                key={key}
                className="flex items-center gap-2 cursor-pointer rounded p-1.5 transition-colors"
                style={{ color: checked ? 'var(--color-text)' : 'var(--color-danger)' }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLLabelElement).style.backgroundColor = 'rgba(255,255,255,0.04)'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLLabelElement).style.backgroundColor = 'transparent'
                }}
              >
                <div
                  className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-colors"
                  style={{
                    backgroundColor: checked ? 'var(--color-success)' : 'transparent',
                    border: `2px solid ${checked ? 'var(--color-success)' : 'var(--color-danger)'}`,
                  }}
                  onClick={() => toggleChecklist(key)}
                >
                  {checked && <Check size={10} color="white" strokeWidth={3} />}
                </div>
                <span className="text-xs">{CHECKLIST_LABELS[key]}</span>
              </label>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default function Step6Specs() {
  const { state, dispatch } = useAppState()
  const { specs } = state
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const addSpec = () => {
    const spec = newSpec()
    dispatch({ type: 'ADD_SPEC', payload: spec })
    setSelectedId(spec.id)
  }

  const removeSpec = (id: string) => {
    dispatch({ type: 'REMOVE_SPEC', payload: id })
    if (selectedId === id) {
      const remaining = specs.filter(s => s.id !== id)
      setSelectedId(remaining[0]?.id ?? null)
    }
  }

  const selected = specs.find(s => s.id === selectedId) ?? specs[0] ?? null
  const incompleteSpecs = specs.filter(s => checklistScore(s.checklist) < 14)

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4 flex-shrink-0">
        <h2 className="text-xl font-semibold mb-1" style={{ color: 'var(--color-text)' }}>
          Spec Builder
        </h2>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Define feature specifications with a completeness checklist. Each spec becomes a markdown
          file in <code className="text-xs px-1 py-0.5 rounded" style={{ backgroundColor: 'var(--color-card)' }}>specs/[domain]/[feature].md</code>
        </p>
      </div>

      {incompleteSpecs.length > 0 && (
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs mb-4 flex-shrink-0"
          style={{
            backgroundColor: 'rgba(245,158,11,0.1)',
            border: '1px solid rgba(245,158,11,0.3)',
            color: 'var(--color-warning)',
          }}
        >
          <AlertCircle size={13} />
          {incompleteSpecs.length} spec{incompleteSpecs.length > 1 ? 's are' : ' is'} incomplete (checklist not 14/14).
          You can still generate, but incomplete specs may produce incomplete tickets.
        </div>
      )}

      {specs.length === 0 ? (
        <div
          className="flex-1 rounded-xl flex flex-col items-center justify-center text-center p-10"
          style={{ border: '1px dashed var(--color-border)' }}
        >
          <p className="text-sm mb-1" style={{ color: 'var(--color-text)' }}>No specs yet</p>
          <p className="text-xs mb-4" style={{ color: 'var(--color-text-muted)' }}>
            Add your first feature spec to get started.
          </p>
          <button
            onClick={addSpec}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white"
            style={{ backgroundColor: 'var(--color-accent)' }}
          >
            <Plus size={14} /> Add Spec
          </button>
        </div>
      ) : (
        <div className="flex gap-4 flex-1 min-h-0">
          {/* Spec list */}
          <div
            className="flex-shrink-0 flex flex-col rounded-lg overflow-hidden"
            style={{
              width: '180px',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-card)',
            }}
          >
            <div className="flex-1 overflow-y-auto">
              {specs.map(spec => {
                const score = checklistScore(spec.checklist)
                const isSelected = selected?.id === spec.id
                return (
                  <div
                    key={spec.id}
                    onClick={() => setSelectedId(spec.id)}
                    className="flex items-center gap-2 px-3 py-2.5 cursor-pointer transition-colors"
                    style={{
                      backgroundColor: isSelected ? 'rgba(99,102,241,0.12)' : 'transparent',
                      borderBottom: '1px solid var(--color-border)',
                    }}
                    onMouseEnter={e => {
                      if (!isSelected) (e.currentTarget as HTMLDivElement).style.backgroundColor = 'rgba(255,255,255,0.04)'
                    }}
                    onMouseLeave={e => {
                      if (!isSelected) (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent'
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-xs font-medium truncate"
                        style={{ color: isSelected ? 'var(--color-accent)' : 'var(--color-text)' }}
                      >
                        {spec.featureName || 'Untitled'}
                      </p>
                      <p className="text-xs" style={{ color: score === 14 ? 'var(--color-success)' : 'var(--color-warning)' }}>
                        {score}/14
                      </p>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); removeSpec(spec.id) }}
                      style={{ color: 'var(--color-danger)' }}
                      className="flex-shrink-0 opacity-60 hover:opacity-100"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                )
              })}
            </div>
            <div className="p-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
              <button
                onClick={addSpec}
                className="w-full flex items-center justify-center gap-1 py-1.5 rounded text-xs font-medium transition-colors"
                style={{
                  backgroundColor: 'var(--color-sidebar)',
                  color: 'var(--color-accent)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <Plus size={11} /> New Spec
              </button>
            </div>
          </div>

          {/* Spec editor */}
          {selected && (
            <div className="flex-1 min-w-0 flex flex-col min-h-0 overflow-y-auto">
              <SpecEditor spec={selected} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

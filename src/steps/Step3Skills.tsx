import { useState } from 'react'
import { useAppState } from '../store'
import type { Skill } from '../types'
import { Plus, Trash2, ChevronDown, ChevronUp, Eye, Zap } from 'lucide-react'

const newSkill = (): Skill => ({
  id: crypto.randomUUID(),
  name: '',
  purpose: '',
  whenToUse: '',
  inputs: [{ name: '', description: '' }],
  process: [''],
  output: '',
  rules: [''],
  example: '',
})

function SkillPreview({ skill }: { skill: Skill }) {
  const md = `# Skill: ${skill.name || 'Untitled'}

## Purpose
${skill.purpose || '_Not specified_'}

## When to Use
${skill.whenToUse || '_Not specified_'}

## Inputs
${skill.inputs.filter(i => i.name).map(i => `- **${i.name}**: ${i.description}`).join('\n') || '_None_'}

## Process
${skill.process.filter(Boolean).map((p, i) => `${i + 1}. ${p}`).join('\n') || '_Not specified_'}

## Output
${skill.output || '_Not specified_'}

## Rules
${skill.rules.filter(Boolean).map(r => `- ${r}`).join('\n') || '_None_'}

## Example
\`\`\`
${skill.example || '_No example provided_'}
\`\`\`
`
  return (
    <pre
      className="rounded-lg p-4 text-xs overflow-auto"
      style={{
        backgroundColor: 'var(--color-bg)',
        border: '1px solid var(--color-border)',
        color: 'var(--color-text-muted)',
        fontFamily: 'monospace',
        maxHeight: '320px',
        whiteSpace: 'pre-wrap',
      }}
    >
      {md}
    </pre>
  )
}

function SkillForm({
  skill,
  onUpdate,
  onDelete,
}: {
  skill: Skill
  onUpdate: (updates: Partial<Skill>) => void
  onDelete: () => void
}) {
  const [showPreview, setShowPreview] = useState(false)
  const [expanded, setExpanded] = useState(true)

  const inputClass = "w-full px-3 py-2 rounded-lg text-sm outline-none"
  const inputStyle = {
    backgroundColor: 'var(--color-bg)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text)',
  }
  const labelStyle = { color: 'var(--color-text-muted)' }

  const updateInput = (idx: number, field: 'name' | 'description', value: string) => {
    const inputs = [...skill.inputs]
    inputs[idx] = { ...inputs[idx], [field]: value }
    onUpdate({ inputs })
  }

  const addInput = () => onUpdate({ inputs: [...skill.inputs, { name: '', description: '' }] })
  const removeInput = (idx: number) => onUpdate({ inputs: skill.inputs.filter((_, i) => i !== idx) })

  const updateListItem = (field: 'process' | 'rules', idx: number, value: string) => {
    const arr = [...skill[field]]
    arr[idx] = value
    onUpdate({ [field]: arr })
  }
  const addListItem = (field: 'process' | 'rules') => onUpdate({ [field]: [...skill[field], ''] })
  const removeListItem = (field: 'process' | 'rules', idx: number) =>
    onUpdate({ [field]: skill[field].filter((_, i) => i !== idx) })

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: '1px solid var(--color-border)' }}
    >
      {/* Card header */}
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer"
        style={{ backgroundColor: 'var(--color-card)' }}
        onClick={() => setExpanded(e => !e)}
      >
        <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
          {skill.name || 'New Skill'}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={e => { e.stopPropagation(); setShowPreview(p => !p) }}
            className="p-1 rounded transition-colors"
            style={{ color: 'var(--color-text-muted)' }}
            title="Preview markdown"
          >
            <Eye size={14} />
          </button>
          <button
            onClick={e => { e.stopPropagation(); onDelete() }}
            className="p-1 rounded transition-colors"
            style={{ color: 'var(--color-danger)' }}
          >
            <Trash2 size={14} />
          </button>
          {expanded ? <ChevronUp size={14} style={{ color: 'var(--color-text-muted)' }} /> : <ChevronDown size={14} style={{ color: 'var(--color-text-muted)' }} />}
        </div>
      </div>

      {expanded && (
        <div className="p-5 space-y-4" style={{ backgroundColor: 'rgba(28,33,40,0.5)' }}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1" style={labelStyle}>Skill Name</label>
              <input
                type="text"
                value={skill.name}
                onChange={e => onUpdate({ name: e.target.value })}
                placeholder="e.g. create-component"
                className={inputClass}
                style={inputStyle}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={labelStyle}>Purpose</label>
              <input
                type="text"
                value={skill.purpose}
                onChange={e => onUpdate({ purpose: e.target.value })}
                placeholder="What does this skill accomplish?"
                className={inputClass}
                style={inputStyle}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1" style={labelStyle}>When to Use</label>
            <textarea
              value={skill.whenToUse}
              onChange={e => onUpdate({ whenToUse: e.target.value })}
              placeholder="Conditions under which Claude should invoke this skill..."
              rows={2}
              className={`${inputClass} resize-none`}
              style={inputStyle}
            />
          </div>

          {/* Inputs */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium" style={labelStyle}>Inputs</label>
              <button
                onClick={addInput}
                className="flex items-center gap-1 text-xs px-2 py-1 rounded"
                style={{ backgroundColor: 'var(--color-sidebar)', color: 'var(--color-accent)', border: '1px solid var(--color-border)' }}
              >
                <Plus size={10} /> Add
              </button>
            </div>
            <div className="space-y-2">
              {skill.inputs.map((inp, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={inp.name}
                    onChange={e => updateInput(i, 'name', e.target.value)}
                    placeholder="name"
                    className="px-2 py-1.5 rounded text-xs w-28 outline-none"
                    style={inputStyle}
                  />
                  <input
                    type="text"
                    value={inp.description}
                    onChange={e => updateInput(i, 'description', e.target.value)}
                    placeholder="description"
                    className="px-2 py-1.5 rounded text-xs flex-1 outline-none"
                    style={inputStyle}
                  />
                  <button onClick={() => removeInput(i)} style={{ color: 'var(--color-danger)' }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Process steps */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium" style={labelStyle}>Process Steps</label>
              <button
                onClick={() => addListItem('process')}
                className="flex items-center gap-1 text-xs px-2 py-1 rounded"
                style={{ backgroundColor: 'var(--color-sidebar)', color: 'var(--color-accent)', border: '1px solid var(--color-border)' }}
              >
                <Plus size={10} /> Add Step
              </button>
            </div>
            <div className="space-y-2">
              {skill.process.map((step, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <span className="text-xs w-5 text-right flex-shrink-0" style={{ color: 'var(--color-text-muted)' }}>{i + 1}.</span>
                  <input
                    type="text"
                    value={step}
                    onChange={e => updateListItem('process', i, e.target.value)}
                    placeholder={`Step ${i + 1}...`}
                    className="flex-1 px-2 py-1.5 rounded text-xs outline-none"
                    style={inputStyle}
                  />
                  <button onClick={() => removeListItem('process', i)} style={{ color: 'var(--color-danger)' }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1" style={labelStyle}>Output Description</label>
            <input
              type="text"
              value={skill.output}
              onChange={e => onUpdate({ output: e.target.value })}
              placeholder="What does this skill produce?"
              className={inputClass}
              style={inputStyle}
            />
          </div>

          {/* Rules */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium" style={labelStyle}>Rules</label>
              <button
                onClick={() => addListItem('rules')}
                className="flex items-center gap-1 text-xs px-2 py-1 rounded"
                style={{ backgroundColor: 'var(--color-sidebar)', color: 'var(--color-accent)', border: '1px solid var(--color-border)' }}
              >
                <Plus size={10} /> Add Rule
              </button>
            </div>
            <div className="space-y-2">
              {skill.rules.map((rule, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={rule}
                    onChange={e => updateListItem('rules', i, e.target.value)}
                    placeholder="e.g. Always add JSDoc comments"
                    className="flex-1 px-2 py-1.5 rounded text-xs outline-none"
                    style={inputStyle}
                  />
                  <button onClick={() => removeListItem('rules', i)} style={{ color: 'var(--color-danger)' }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1" style={labelStyle}>Example Invocation</label>
            <textarea
              value={skill.example}
              onChange={e => onUpdate({ example: e.target.value })}
              placeholder="e.g. /create-component Button --variant=primary"
              rows={2}
              className={`${inputClass} resize-none font-mono`}
              style={inputStyle}
            />
          </div>

          {showPreview && (
            <div className="pt-2">
              <p className="text-xs mb-2 font-medium" style={{ color: 'var(--color-text-muted)' }}>
                .claude/skills/{skill.name || 'skill'}.md preview:
              </p>
              <SkillPreview skill={skill} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function Step3Skills() {
  const { state, dispatch } = useAppState()
  const { skills } = state

  const addSkill = () => {
    dispatch({ type: 'ADD_SKILL', payload: newSkill() })
  }

  const updateSkill = (id: string, updates: Partial<Skill>) => {
    dispatch({ type: 'UPDATE_SKILL', payload: { id, updates } })
  }

  const removeSkill = (id: string) => {
    dispatch({ type: 'REMOVE_SKILL', payload: id })
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-1" style={{ color: 'var(--color-text)' }}>
          Claude Code Skills
        </h2>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Skills are reusable workflows invoked with a slash command. Each skill is written
          as a structured markdown file in <code className="text-xs px-1 py-0.5 rounded" style={{ backgroundColor: 'var(--color-card)' }}>.claude/skills/</code>.
        </p>
      </div>

      {skills.length === 0 ? (
        <div
          className="rounded-xl p-10 text-center mb-4"
          style={{ border: '1px dashed var(--color-border)' }}
        >
          <Zap size={28} className="mx-auto mb-3" style={{ color: 'var(--color-text-muted)' }} />
          <p className="text-sm mb-1" style={{ color: 'var(--color-text)' }}>No skills defined yet</p>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            Skills let Claude execute complex, repeatable tasks reliably.
          </p>
        </div>
      ) : (
        <div className="space-y-3 mb-4">
          {skills.map(skill => (
            <SkillForm
              key={skill.id}
              skill={skill}
              onUpdate={updates => updateSkill(skill.id, updates)}
              onDelete={() => removeSkill(skill.id)}
            />
          ))}
        </div>
      )}

      <button
        onClick={addSkill}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150"
        style={{
          backgroundColor: 'var(--color-accent)',
          color: 'white',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-accent-hover)'
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-accent)'
        }}
      >
        <Plus size={14} /> Add Skill
      </button>
    </div>
  )
}

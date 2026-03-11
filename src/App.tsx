import { AppProvider, useAppState } from './store'
import {
  FolderOpen,
  Plug,
  Zap,
  GitBranch,
  FileText,
  ClipboardList,
  Rocket,
  Check,
} from 'lucide-react'
import Step1Project from './steps/Step1Project'
import Step2MCPs from './steps/Step2MCPs'
import Step3Skills from './steps/Step3Skills'
import Step4Hooks from './steps/Step4Hooks'
import Step5Rules from './steps/Step5Rules'
import Step6Specs from './steps/Step6Specs'
import Step7Generate from './steps/Step7Generate'

const STEPS = [
  { number: 1, name: 'Project', icon: FolderOpen },
  { number: 2, name: 'MCPs', icon: Plug },
  { number: 3, name: 'Skills', icon: Zap },
  { number: 4, name: 'Hooks', icon: GitBranch },
  { number: 5, name: 'Rules', icon: FileText },
  { number: 6, name: 'Specs', icon: ClipboardList },
  { number: 7, name: 'Generate', icon: Rocket },
]

function stepHasData(step: number, state: ReturnType<typeof useAppState>['state']): boolean {
  switch (step) {
    case 1:
      return !!(state.project.name && state.project.repoPath)
    case 2:
      return state.mcps.some(m => m.enabled)
    case 3:
      return state.skills.length > 0
    case 4:
      return state.hooks.some(h => h.enabled)
    case 5:
      return state.rules.length > 0
    case 6:
      return state.specs.length > 0
    case 7:
      return false
    default:
      return false
  }
}

function WizardShell() {
  const { state, dispatch } = useAppState()
  const { currentStep } = state

  const setStep = (n: number) => dispatch({ type: 'SET_STEP', payload: n })

  const canGoNext = currentStep < 7
  const canGoBack = currentStep > 1

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <Step1Project />
      case 2: return <Step2MCPs />
      case 3: return <Step3Skills />
      case 4: return <Step4Hooks />
      case 5: return <Step5Rules />
      case 6: return <Step6Specs />
      case 7: return <Step7Generate />
      default: return null
    }
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Sidebar */}
      <aside
        className="flex flex-col flex-shrink-0 w-56 h-full border-r"
        style={{
          backgroundColor: 'var(--color-sidebar)',
          borderColor: 'var(--color-border)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 px-5 py-5 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center text-white font-bold text-sm"
            style={{ backgroundColor: 'var(--color-accent)' }}
          >
            S
          </div>
          <span className="font-semibold text-sm tracking-wide" style={{ color: 'var(--color-text)' }}>
            SpecPilot
          </span>
        </div>

        {/* Step list */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {STEPS.map(step => {
            const Icon = step.icon
            const isActive = currentStep === step.number
            const isDone = stepHasData(step.number, state)
            return (
              <button
                key={step.number}
                onClick={() => setStep(step.number)}
                className="w-full flex items-center gap-3 px-5 py-3 text-left transition-all duration-150 relative"
                style={{
                  backgroundColor: isActive ? 'rgba(99,102,241,0.12)' : 'transparent',
                  color: isActive
                    ? 'var(--color-accent)'
                    : isDone
                    ? 'var(--color-text)'
                    : 'var(--color-text-muted)',
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(255,255,255,0.04)'
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'
                  }
                }}
              >
                {isActive && (
                  <div
                    className="absolute left-0 top-0 bottom-0 w-0.5 rounded-r"
                    style={{ backgroundColor: 'var(--color-accent)' }}
                  />
                )}
                <div className="relative flex-shrink-0">
                  <Icon size={15} />
                  {isDone && (
                    <div
                      className="absolute -top-1 -right-1 w-3 h-3 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: 'var(--color-success)' }}
                    >
                      <Check size={7} strokeWidth={3} color="white" />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)', minWidth: '14px' }}>
                    {step.number}
                  </span>
                  <span className="text-sm font-medium truncate">{step.name}</span>
                </div>
              </button>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            Spec-driven dev wizard
          </p>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 h-full">
        {/* Step header */}
        <header
          className="flex items-center justify-between px-8 py-4 border-b flex-shrink-0"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <div>
            <h1 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
              {STEPS[currentStep - 1].name}
            </h1>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
              Step {currentStep} of {STEPS.length}
            </p>
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-3">
            <div className="w-32 h-1.5 rounded-full" style={{ backgroundColor: 'var(--color-border)' }}>
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${(currentStep / STEPS.length) * 100}%`,
                  backgroundColor: 'var(--color-accent)',
                }}
              />
            </div>
            <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
              {Math.round((currentStep / STEPS.length) * 100)}%
            </span>
          </div>
        </header>

        {/* Step content */}
        <main className="flex-1 overflow-y-auto px-8 py-6">
          {renderStep()}
        </main>

        {/* Navigation */}
        <footer
          className="flex items-center justify-between px-8 py-4 border-t flex-shrink-0"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <button
            onClick={() => canGoBack && setStep(currentStep - 1)}
            disabled={!canGoBack}
            className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-150"
            style={{
              backgroundColor: canGoBack ? 'var(--color-card)' : 'transparent',
              color: canGoBack ? 'var(--color-text)' : 'var(--color-text-muted)',
              border: `1px solid ${canGoBack ? 'var(--color-border)' : 'transparent'}`,
              cursor: canGoBack ? 'pointer' : 'not-allowed',
            }}
          >
            Back
          </button>

          {canGoNext && (
            <button
              onClick={() => setStep(currentStep + 1)}
              className="px-5 py-2 text-sm font-medium rounded-lg text-white transition-all duration-150"
              style={{ backgroundColor: 'var(--color-accent)' }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-accent-hover)'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-accent)'
              }}
            >
              {currentStep === 6 ? 'Go to Generate' : 'Next'}
            </button>
          )}
        </footer>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <WizardShell />
    </AppProvider>
  )
}

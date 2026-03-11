import { createContext, useContext, useReducer, type ReactNode, type Dispatch } from 'react'
import type { AppState, ProjectConfig, MCPServer, Skill, Hook, RulesFile, Spec, LinearConfig } from './types'
import { defaultMCPs } from './data/mcps'
import { hookPresets } from './data/hookPresets'

const initialState: AppState = {
  currentStep: 1,
  project: {
    name: '',
    repoPath: '',
    framework: '',
    packageManager: 'bun',
    language: 'TypeScript',
    deployTarget: '',
    description: '',
  },
  mcps: defaultMCPs,
  skills: [],
  hooks: hookPresets,
  rules: [],
  specs: [],
  linear: {
    apiKey: '',
    teamId: '',
    projectId: '',
  },
}

type Action =
  | { type: 'SET_STEP'; payload: number }
  | { type: 'UPDATE_PROJECT'; payload: Partial<ProjectConfig> }
  | { type: 'SET_MCPS'; payload: MCPServer[] }
  | { type: 'UPDATE_MCP'; payload: { id: string; updates: Partial<MCPServer> } }
  | { type: 'ADD_SKILL'; payload: Skill }
  | { type: 'UPDATE_SKILL'; payload: { id: string; updates: Partial<Skill> } }
  | { type: 'REMOVE_SKILL'; payload: string }
  | { type: 'SET_HOOKS'; payload: Hook[] }
  | { type: 'ADD_HOOK'; payload: Hook }
  | { type: 'UPDATE_HOOK'; payload: { id: string; updates: Partial<Hook> } }
  | { type: 'REMOVE_HOOK'; payload: string }
  | { type: 'ADD_RULE'; payload: RulesFile }
  | { type: 'UPDATE_RULE'; payload: { id: string; updates: Partial<RulesFile> } }
  | { type: 'REMOVE_RULE'; payload: string }
  | { type: 'ADD_SPEC'; payload: Spec }
  | { type: 'UPDATE_SPEC'; payload: { id: string; updates: Partial<Spec> } }
  | { type: 'REMOVE_SPEC'; payload: string }
  | { type: 'UPDATE_LINEAR'; payload: Partial<LinearConfig> }

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.payload }

    case 'UPDATE_PROJECT':
      return { ...state, project: { ...state.project, ...action.payload } }

    case 'SET_MCPS':
      return { ...state, mcps: action.payload }

    case 'UPDATE_MCP':
      return {
        ...state,
        mcps: state.mcps.map(m =>
          m.id === action.payload.id ? { ...m, ...action.payload.updates } : m
        ),
      }

    case 'ADD_SKILL':
      return { ...state, skills: [...state.skills, action.payload] }

    case 'UPDATE_SKILL':
      return {
        ...state,
        skills: state.skills.map(s =>
          s.id === action.payload.id ? { ...s, ...action.payload.updates } : s
        ),
      }

    case 'REMOVE_SKILL':
      return { ...state, skills: state.skills.filter(s => s.id !== action.payload) }

    case 'SET_HOOKS':
      return { ...state, hooks: action.payload }

    case 'ADD_HOOK':
      return { ...state, hooks: [...state.hooks, action.payload] }

    case 'UPDATE_HOOK':
      return {
        ...state,
        hooks: state.hooks.map(h =>
          h.id === action.payload.id ? { ...h, ...action.payload.updates } : h
        ),
      }

    case 'REMOVE_HOOK':
      return { ...state, hooks: state.hooks.filter(h => h.id !== action.payload) }

    case 'ADD_RULE':
      return { ...state, rules: [...state.rules, action.payload] }

    case 'UPDATE_RULE':
      return {
        ...state,
        rules: state.rules.map(r =>
          r.id === action.payload.id ? { ...r, ...action.payload.updates } : r
        ),
      }

    case 'REMOVE_RULE':
      return { ...state, rules: state.rules.filter(r => r.id !== action.payload) }

    case 'ADD_SPEC':
      return { ...state, specs: [...state.specs, action.payload] }

    case 'UPDATE_SPEC':
      return {
        ...state,
        specs: state.specs.map(s =>
          s.id === action.payload.id ? { ...s, ...action.payload.updates } : s
        ),
      }

    case 'REMOVE_SPEC':
      return { ...state, specs: state.specs.filter(s => s.id !== action.payload) }

    case 'UPDATE_LINEAR':
      return { ...state, linear: { ...state.linear, ...action.payload } }

    default:
      return state
  }
}

interface AppContextType {
  state: AppState
  dispatch: Dispatch<Action>
}

const AppContext = createContext<AppContextType | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>
}

export function useAppState(): AppContextType {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppState must be used within AppProvider')
  return ctx
}

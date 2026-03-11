import type { Hook } from '../types'

export const hookPresets: Hook[] = [
  {
    id: 'tsc-on-save',
    name: 'TypeScript Type Check',
    trigger: 'PostToolUse',
    matcher: 'Edit|Write',
    command: 'npx tsc --noEmit',
    purpose: 'Run TypeScript type checking after every file edit to catch type errors immediately',
    enabled: false,
  },
  {
    id: 'eslint-on-save',
    name: 'ESLint on Save',
    trigger: 'PostToolUse',
    matcher: 'Edit|Write',
    command: 'npx eslint {{file}} --fix',
    purpose: 'Auto-fix ESLint issues whenever Claude edits or writes a file',
    enabled: false,
  },
  {
    id: 'tests-on-save',
    name: 'Run Tests on Save',
    trigger: 'PostToolUse',
    matcher: 'Edit|Write',
    command: 'bun test',
    purpose: 'Run the test suite after each file change to detect regressions immediately',
    enabled: false,
  },
  {
    id: 'bundle-size-on-stop',
    name: 'Bundle Size Check',
    trigger: 'Stop',
    matcher: '',
    command: 'bun run build && echo "Build OK"',
    purpose: 'Verify the project still builds successfully at the end of every Claude session',
    enabled: false,
  },
  {
    id: 'lint-staged-on-stop',
    name: 'Lint Staged on Stop',
    trigger: 'Stop',
    matcher: '',
    command: 'npx lint-staged',
    purpose: 'Run lint-staged checks on all modified files when Claude finishes a session',
    enabled: false,
  },
]

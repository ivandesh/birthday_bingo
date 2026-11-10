# Birthday Bingo Party App — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a mobile-first birthday party bingo web app where players scan QR codes to access their unique digital bingo cards, mark challenges complete, and spin a prize wheel on their first bingo.

**Architecture:** React + Vite + TypeScript frontend talking directly to Supabase (Postgres + real-time). No custom backend. Deployed to GitHub Pages as a static site.

**Tech Stack:** React 18, Vite, TypeScript, Supabase JS client, React Router, qrcode.react, CSS Modules

---

## File Structure

```
birthday-bingo/
├── .env.example                    # Supabase URL + anon key template
├── .gitignore
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── supabase/
│   └── schema.sql                  # Full database schema for Supabase SQL editor
├── src/
│   ├── main.tsx                    # App entry point
│   ├── App.tsx                     # Router setup
│   ├── supabaseClient.ts          # Supabase client singleton
│   ├── types.ts                   # Shared TypeScript types matching DB schema
│   ├── utils/
│   │   ├── generateToken.ts       # Random 6-char alphanumeric token generator
│   │   ├── bingoDetection.ts      # Check rows/cols/diagonals for completion
│   │   └── shuffleCards.ts        # Generate randomized card assignments
│   ├── pages/
│   │   ├── JoinPage.tsx           # Player join screen (/?card=<token>)
│   │   ├── JoinPage.module.css
│   │   ├── PlayPage.tsx           # Bingo card gameplay
│   │   ├── PlayPage.module.css
│   │   ├── AdminPage.tsx          # Admin panel (/manage-party)
│   │   ├── AdminPage.module.css
│   │   ├── PrintPage.tsx          # Printable cards (/manage-party/print)
│   │   └── PrintPage.module.css
│   ├── components/
│   │   ├── BingoGrid.tsx          # Renders the NxN bingo grid
│   │   ├── BingoGrid.module.css
│   │   ├── BingoCell.tsx          # Single cell with tap-to-complete
│   │   ├── BingoCell.module.css
│   │   ├── PrizeWheel.tsx         # Animated spinning wheel
│   │   ├── PrizeWheel.module.css
│   │   ├── CongratsScreen.tsx     # Subsequent bingo celebration
│   │   ├── CongratsScreen.module.css
│   │   ├── ChallengeManager.tsx   # Admin: CRUD challenges
│   │   ├── ChallengeManager.module.css
│   │   ├── PrizeManager.tsx       # Admin: CRUD prizes
│   │   ├── PrizeManager.module.css
│   │   ├── CardGenerator.tsx      # Admin: generate N cards
│   │   ├── CardGenerator.module.css
│   │   ├── LiveDashboard.tsx      # Admin: player progress view
│   │   ├── LiveDashboard.module.css
│   │   ├── PrintableCard.tsx      # Single printable card (front + back)
│   │   └── PrintableCard.module.css
│   └── __tests__/
│       ├── generateToken.test.ts
│       ├── bingoDetection.test.ts
│       └── shuffleCards.test.ts
```

---

## Task 1: Project Scaffolding

**Files:**
- Create: `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`, `.gitignore`, `.env.example`, `src/main.tsx`, `src/App.tsx`

- [ ] **Step 1: Initialize Vite + React + TypeScript project**

```bash
cd /c/Users/USER/birthday-bingo
npm create vite@latest . -- --template react-ts
```

Select "Ignore files and continue" if prompted about existing files.

- [ ] **Step 2: Install dependencies**

```bash
npm install @supabase/supabase-js react-router-dom qrcode.react
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

- [ ] **Step 3: Configure Vite for GitHub Pages and testing**

Replace `vite.config.ts` with:

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/birthday-bingo/',
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [],
  },
})
```

- [ ] **Step 4: Create `.env.example`**

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

- [ ] **Step 5: Update `.gitignore`**

Append to the generated `.gitignore`:

```
.env
```

- [ ] **Step 6: Create Supabase client singleton**

Create `src/supabaseClient.ts`:

```ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

- [ ] **Step 7: Create shared types**

Create `src/types.ts`:

```ts
export interface Config {
  id: number
  grid_size: number
  created_at: string
}

export interface Challenge {
  id: string
  text: string
  created_at: string
}

export interface Prize {
  id: string
  name: string
  won_by: string | null
  created_at: string
}

export interface Player {
  id: string
  name: string
  card_token: string
  created_at: string
}

export interface Card {
  id: string
  player_id: string
  challenge_id: string
  row: number
  col: number
  completed: boolean
}

export interface ClaimedLine {
  id: string
  player_id: string
  line_type: 'row' | 'col' | 'diagonal'
  line_index: number
  is_first: boolean
  prize_id: string | null
  created_at: string
}

export interface CardCell extends Card {
  challenge_text: string
}
```

- [ ] **Step 8: Set up React Router in App.tsx**

Replace `src/App.tsx` with:

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'

function Placeholder({ name }: { name: string }) {
  return <div>{name} — coming soon</div>
}

export default function App() {
  return (
    <BrowserRouter basename="/birthday-bingo">
      <Routes>
        <Route path="/" element={<Placeholder name="Join" />} />
        <Route path="/play" element={<Placeholder name="Play" />} />
        <Route path="/manage-party" element={<Placeholder name="Admin" />} />
        <Route path="/manage-party/print" element={<Placeholder name="Print" />} />
      </Routes>
    </BrowserRouter>
  )
}
```

- [ ] **Step 9: Clean up main.tsx**

Replace `src/main.tsx` with:

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 10: Verify it runs**

```bash
npm run dev
```

Expected: App runs on localhost, shows "Join — coming soon" at root.

- [ ] **Step 11: Commit**

```bash
git init
git add -A
git commit -m "feat: scaffold project with Vite, React, TypeScript, Supabase client, and routing"
```

---

## Task 2: Supabase Database Schema

**Files:**
- Create: `supabase/schema.sql`

- [ ] **Step 1: Write the full SQL schema**

Create `supabase/schema.sql`:

```sql
-- Birthday Bingo Party App Schema
-- Run this in the Supabase SQL Editor

-- Config table (single row for game settings)
create table config (
  id int primary key default 1 check (id = 1),
  grid_size int not null default 4 check (grid_size in (4, 5)),
  created_at timestamptz default now()
);

insert into config (grid_size) values (4);

-- Challenges pool
create table challenges (
  id uuid primary key default gen_random_uuid(),
  text text not null,
  created_at timestamptz default now()
);

-- Players
create table players (
  id uuid primary key default gen_random_uuid(),
  name text,
  card_token text unique not null,
  created_at timestamptz default now()
);

-- Prizes
create table prizes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  won_by uuid references players(id),
  created_at timestamptz default now()
);

-- Bingo cards (one row per cell)
create table cards (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references players(id) on delete cascade,
  challenge_id uuid not null references challenges(id),
  row int not null,
  col int not null,
  completed boolean not null default false,
  unique(player_id, row, col)
);

-- Tracks which bingo lines have been claimed
create table claimed_lines (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references players(id) on delete cascade,
  line_type text not null check (line_type in ('row', 'col', 'diagonal')),
  line_index int not null,
  is_first boolean not null default false,
  prize_id uuid references prizes(id),
  created_at timestamptz default now(),
  unique(player_id, line_type, line_index)
);

-- Enable realtime on prizes table
alter publication supabase_realtime add table prizes;
alter publication supabase_realtime add table cards;
```

- [ ] **Step 2: Apply the schema**

Go to your Supabase project dashboard → SQL Editor → paste the contents of `supabase/schema.sql` → click Run.

Expected: All tables created, config row inserted, realtime enabled.

- [ ] **Step 3: Disable RLS on all tables**

In Supabase dashboard → Authentication → Policies, ensure RLS is disabled for: `config`, `challenges`, `players`, `prizes`, `cards`, `claimed_lines`.

Alternatively, run in SQL Editor:

```sql
alter table config disable row level security;
alter table challenges disable row level security;
alter table players disable row level security;
alter table prizes disable row level security;
alter table cards disable row level security;
alter table claimed_lines disable row level security;
```

- [ ] **Step 4: Create `.env` with your Supabase credentials**

```bash
cp .env.example .env
```

Edit `.env` with your actual Supabase URL and anon key from the Supabase dashboard → Settings → API.

- [ ] **Step 5: Commit**

```bash
git add supabase/schema.sql
git commit -m "feat: add Supabase database schema"
```

---

## Task 3: Utility Functions (with TDD)

**Files:**
- Create: `src/utils/generateToken.ts`, `src/utils/bingoDetection.ts`, `src/utils/shuffleCards.ts`
- Create: `src/__tests__/generateToken.test.ts`, `src/__tests__/bingoDetection.test.ts`, `src/__tests__/shuffleCards.test.ts`

### 3a: Token Generator

- [ ] **Step 1: Write failing test**

Create `src/__tests__/generateToken.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { generateToken } from '../utils/generateToken'

describe('generateToken', () => {
  it('returns a 6-character string', () => {
    const token = generateToken()
    expect(token).toHaveLength(6)
  })

  it('contains only alphanumeric characters', () => {
    const token = generateToken()
    expect(token).toMatch(/^[a-z0-9]{6}$/)
  })

  it('generates unique tokens', () => {
    const tokens = new Set(Array.from({ length: 100 }, () => generateToken()))
    expect(tokens.size).toBeGreaterThan(90)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/__tests__/generateToken.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

Create `src/utils/generateToken.ts`:

```ts
const CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789'

export function generateToken(length = 6): string {
  let token = ''
  for (let i = 0; i < length; i++) {
    token += CHARS[Math.floor(Math.random() * CHARS.length)]
  }
  return token
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/__tests__/generateToken.test.ts
```

Expected: All 3 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/utils/generateToken.ts src/__tests__/generateToken.test.ts
git commit -m "feat: add random token generator with tests"
```

### 3b: Bingo Detection

- [ ] **Step 6: Write failing tests**

Create `src/__tests__/bingoDetection.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { findCompletedLines, type CellGrid } from '../utils/bingoDetection'

function makeGrid(size: number, completed: [number, number][]): CellGrid {
  const grid: CellGrid = []
  for (let r = 0; r < size; r++) {
    grid[r] = []
    for (let c = 0; c < size; c++) {
      grid[r][c] = completed.some(([cr, cc]) => cr === r && cc === c)
    }
  }
  return grid
}

describe('findCompletedLines', () => {
  it('detects a completed row', () => {
    const grid = makeGrid(4, [[0,0],[0,1],[0,2],[0,3]])
    const lines = findCompletedLines(grid)
    expect(lines).toContainEqual({ type: 'row', index: 0 })
  })

  it('detects a completed column', () => {
    const grid = makeGrid(4, [[0,2],[1,2],[2,2],[3,2]])
    const lines = findCompletedLines(grid)
    expect(lines).toContainEqual({ type: 'col', index: 2 })
  })

  it('detects main diagonal', () => {
    const grid = makeGrid(4, [[0,0],[1,1],[2,2],[3,3]])
    const lines = findCompletedLines(grid)
    expect(lines).toContainEqual({ type: 'diagonal', index: 0 })
  })

  it('detects anti-diagonal', () => {
    const grid = makeGrid(4, [[0,3],[1,2],[2,1],[3,0]])
    const lines = findCompletedLines(grid)
    expect(lines).toContainEqual({ type: 'diagonal', index: 1 })
  })

  it('returns empty array when no lines complete', () => {
    const grid = makeGrid(4, [[0,0],[0,1],[0,2]])
    const lines = findCompletedLines(grid)
    expect(lines).toEqual([])
  })

  it('works with 5x5 grid', () => {
    const grid = makeGrid(5, [[2,0],[2,1],[2,2],[2,3],[2,4]])
    const lines = findCompletedLines(grid)
    expect(lines).toContainEqual({ type: 'row', index: 2 })
  })

  it('detects multiple completed lines at once', () => {
    // Row 0 and col 0 both complete in a 4x4
    const grid = makeGrid(4, [
      [0,0],[0,1],[0,2],[0,3],
      [1,0],[2,0],[3,0]
    ])
    const lines = findCompletedLines(grid)
    expect(lines).toContainEqual({ type: 'row', index: 0 })
    expect(lines).toContainEqual({ type: 'col', index: 0 })
  })
})
```

- [ ] **Step 7: Run test to verify it fails**

```bash
npx vitest run src/__tests__/bingoDetection.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 8: Implement**

Create `src/utils/bingoDetection.ts`:

```ts
export type CellGrid = boolean[][]

export interface CompletedLine {
  type: 'row' | 'col' | 'diagonal'
  index: number
}

export function findCompletedLines(grid: CellGrid): CompletedLine[] {
  const size = grid.length
  const lines: CompletedLine[] = []

  // Check rows
  for (let r = 0; r < size; r++) {
    if (grid[r].every(cell => cell)) {
      lines.push({ type: 'row', index: r })
    }
  }

  // Check columns
  for (let c = 0; c < size; c++) {
    let complete = true
    for (let r = 0; r < size; r++) {
      if (!grid[r][c]) { complete = false; break }
    }
    if (complete) lines.push({ type: 'col', index: c })
  }

  // Main diagonal (top-left to bottom-right)
  let mainDiag = true
  for (let i = 0; i < size; i++) {
    if (!grid[i][i]) { mainDiag = false; break }
  }
  if (mainDiag) lines.push({ type: 'diagonal', index: 0 })

  // Anti-diagonal (top-right to bottom-left)
  let antiDiag = true
  for (let i = 0; i < size; i++) {
    if (!grid[i][size - 1 - i]) { antiDiag = false; break }
  }
  if (antiDiag) lines.push({ type: 'diagonal', index: 1 })

  return lines
}
```

- [ ] **Step 9: Run test to verify it passes**

```bash
npx vitest run src/__tests__/bingoDetection.test.ts
```

Expected: All 7 tests PASS.

- [ ] **Step 10: Commit**

```bash
git add src/utils/bingoDetection.ts src/__tests__/bingoDetection.test.ts
git commit -m "feat: add bingo line detection with tests"
```

### 3c: Card Shuffler

- [ ] **Step 11: Write failing tests**

Create `src/__tests__/shuffleCards.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { generateCardAssignments } from '../utils/shuffleCards'

describe('generateCardAssignments', () => {
  const challengeIds = Array.from({ length: 25 }, (_, i) => `ch-${i}`)

  it('returns correct number of cells for a 4x4 grid', () => {
    const cells = generateCardAssignments(challengeIds, 4)
    expect(cells).toHaveLength(16)
  })

  it('returns correct number of cells for a 5x5 grid', () => {
    const cells = generateCardAssignments(challengeIds, 5)
    expect(cells).toHaveLength(25)
  })

  it('each cell has row and col within grid bounds', () => {
    const cells = generateCardAssignments(challengeIds, 4)
    for (const cell of cells) {
      expect(cell.row).toBeGreaterThanOrEqual(0)
      expect(cell.row).toBeLessThan(4)
      expect(cell.col).toBeGreaterThanOrEqual(0)
      expect(cell.col).toBeLessThan(4)
    }
  })

  it('each position (row,col) is unique', () => {
    const cells = generateCardAssignments(challengeIds, 4)
    const positions = cells.map(c => `${c.row},${c.col}`)
    expect(new Set(positions).size).toBe(16)
  })

  it('uses challenges from the provided pool', () => {
    const cells = generateCardAssignments(challengeIds, 4)
    for (const cell of cells) {
      expect(challengeIds).toContain(cell.challengeId)
    }
  })

  it('produces different arrangements on multiple calls', () => {
    const results = Array.from({ length: 10 }, () =>
      generateCardAssignments(challengeIds, 4).map(c => c.challengeId).join(',')
    )
    const unique = new Set(results)
    expect(unique.size).toBeGreaterThan(1)
  })
})
```

- [ ] **Step 12: Run test to verify it fails**

```bash
npx vitest run src/__tests__/shuffleCards.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 13: Implement**

Create `src/utils/shuffleCards.ts`:

```ts
export interface CardAssignment {
  challengeId: string
  row: number
  col: number
}

function shuffle<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export function generateCardAssignments(
  challengeIds: string[],
  gridSize: number
): CardAssignment[] {
  const totalCells = gridSize * gridSize
  // Shuffle and pick enough challenges (with possible repeats if pool is smaller)
  let pool = shuffle(challengeIds)
  while (pool.length < totalCells) {
    pool = [...pool, ...shuffle(challengeIds)]
  }
  const selected = pool.slice(0, totalCells)

  const cells: CardAssignment[] = []
  let idx = 0
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      cells.push({ challengeId: selected[idx], row, col })
      idx++
    }
  }
  return cells
}
```

- [ ] **Step 14: Run test to verify it passes**

```bash
npx vitest run src/__tests__/shuffleCards.test.ts
```

Expected: All 6 tests PASS.

- [ ] **Step 15: Commit**

```bash
git add src/utils/shuffleCards.ts src/__tests__/shuffleCards.test.ts
git commit -m "feat: add card shuffle/generation logic with tests"
```

---

## Task 4: Admin Page — Challenge & Prize Management

**Files:**
- Create: `src/pages/AdminPage.tsx`, `src/pages/AdminPage.module.css`
- Create: `src/components/ChallengeManager.tsx`, `src/components/ChallengeManager.module.css`
- Create: `src/components/PrizeManager.tsx`, `src/components/PrizeManager.module.css`
- Modify: `src/App.tsx` (replace placeholder route)

- [ ] **Step 1: Build ChallengeManager component**

Create `src/components/ChallengeManager.tsx`:

```tsx
import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import type { Challenge } from '../types'
import styles from './ChallengeManager.module.css'

export default function ChallengeManager() {
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [text, setText] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')

  useEffect(() => {
    loadChallenges()
  }, [])

  async function loadChallenges() {
    const { data } = await supabase
      .from('challenges')
      .select('*')
      .order('created_at')
    if (data) setChallenges(data)
  }

  async function addChallenge() {
    if (!text.trim()) return
    await supabase.from('challenges').insert({ text: text.trim() })
    setText('')
    loadChallenges()
  }

  async function deleteChallenge(id: string) {
    await supabase.from('challenges').delete().eq('id', id)
    loadChallenges()
  }

  async function saveEdit(id: string) {
    if (!editText.trim()) return
    await supabase.from('challenges').update({ text: editText.trim() }).eq('id', id)
    setEditingId(null)
    loadChallenges()
  }

  return (
    <div className={styles.container}>
      <h2>Челенджі</h2>
      <div className={styles.addRow}>
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Новий челендж..."
          onKeyDown={e => e.key === 'Enter' && addChallenge()}
        />
        <button onClick={addChallenge}>Додати</button>
      </div>
      <div className={styles.count}>Всього: {challenges.length}</div>
      <ul className={styles.list}>
        {challenges.map(ch => (
          <li key={ch.id}>
            {editingId === ch.id ? (
              <div className={styles.editRow}>
                <input
                  value={editText}
                  onChange={e => setEditText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && saveEdit(ch.id)}
                />
                <button onClick={() => saveEdit(ch.id)}>Зберегти</button>
                <button onClick={() => setEditingId(null)}>Скасувати</button>
              </div>
            ) : (
              <div className={styles.itemRow}>
                <span>{ch.text}</span>
                <div>
                  <button onClick={() => { setEditingId(ch.id); setEditText(ch.text) }}>✏️</button>
                  <button onClick={() => deleteChallenge(ch.id)}>🗑️</button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
```

- [ ] **Step 2: Style ChallengeManager**

Create `src/components/ChallengeManager.module.css`:

```css
.container {
  margin-bottom: 2rem;
}

.addRow {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.addRow input {
  flex: 1;
  padding: 0.5rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 6px;
}

.addRow button {
  padding: 0.5rem 1rem;
  font-size: 1rem;
  border: none;
  border-radius: 6px;
  background: #4f46e5;
  color: white;
  cursor: pointer;
}

.count {
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.list {
  list-style: none;
  padding: 0;
}

.list li {
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
}

.itemRow {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.itemRow button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
  padding: 0.25rem;
}

.editRow {
  display: flex;
  gap: 0.5rem;
}

.editRow input {
  flex: 1;
  padding: 0.4rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 6px;
}

.editRow button {
  padding: 0.4rem 0.75rem;
  font-size: 0.875rem;
  border: none;
  border-radius: 6px;
  background: #e5e7eb;
  cursor: pointer;
}
```

- [ ] **Step 3: Build PrizeManager component**

Create `src/components/PrizeManager.tsx`:

```tsx
import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import type { Prize } from '../types'
import styles from './PrizeManager.module.css'

export default function PrizeManager() {
  const [prizes, setPrizes] = useState<Prize[]>([])
  const [name, setName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  useEffect(() => {
    loadPrizes()
  }, [])

  async function loadPrizes() {
    const { data } = await supabase
      .from('prizes')
      .select('*')
      .order('created_at')
    if (data) setPrizes(data)
  }

  async function addPrize() {
    if (!name.trim()) return
    await supabase.from('prizes').insert({ name: name.trim() })
    setName('')
    loadPrizes()
  }

  async function deletePrize(id: string) {
    await supabase.from('prizes').delete().eq('id', id)
    loadPrizes()
  }

  async function saveEdit(id: string) {
    if (!editName.trim()) return
    await supabase.from('prizes').update({ name: editName.trim() }).eq('id', id)
    setEditingId(null)
    loadPrizes()
  }

  const available = prizes.filter(p => !p.won_by)
  const won = prizes.filter(p => p.won_by)

  return (
    <div className={styles.container}>
      <h2>Призи</h2>
      <div className={styles.addRow}>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Новий приз..."
          onKeyDown={e => e.key === 'Enter' && addPrize()}
        />
        <button onClick={addPrize}>Додати</button>
      </div>
      <div className={styles.count}>
        Доступні: {available.length} | Виграні: {won.length}
      </div>
      <ul className={styles.list}>
        {prizes.map(prize => (
          <li key={prize.id} className={prize.won_by ? styles.won : ''}>
            {editingId === prize.id ? (
              <div className={styles.editRow}>
                <input
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && saveEdit(prize.id)}
                />
                <button onClick={() => saveEdit(prize.id)}>Зберегти</button>
                <button onClick={() => setEditingId(null)}>Скасувати</button>
              </div>
            ) : (
              <div className={styles.itemRow}>
                <span>
                  {prize.name}
                  {prize.won_by && ' ✅'}
                </span>
                {!prize.won_by && (
                  <div>
                    <button onClick={() => { setEditingId(prize.id); setEditName(prize.name) }}>✏️</button>
                    <button onClick={() => deletePrize(prize.id)}>🗑️</button>
                  </div>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
```

- [ ] **Step 4: Style PrizeManager**

Create `src/components/PrizeManager.module.css`:

```css
.container {
  margin-bottom: 2rem;
}

.addRow {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.addRow input {
  flex: 1;
  padding: 0.5rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 6px;
}

.addRow button {
  padding: 0.5rem 1rem;
  font-size: 1rem;
  border: none;
  border-radius: 6px;
  background: #4f46e5;
  color: white;
  cursor: pointer;
}

.count {
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.list {
  list-style: none;
  padding: 0;
}

.list li {
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
}

.won {
  opacity: 0.5;
}

.itemRow {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.itemRow button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
  padding: 0.25rem;
}

.editRow {
  display: flex;
  gap: 0.5rem;
}

.editRow input {
  flex: 1;
  padding: 0.4rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 6px;
}

.editRow button {
  padding: 0.4rem 0.75rem;
  font-size: 0.875rem;
  border: none;
  border-radius: 6px;
  background: #e5e7eb;
  cursor: pointer;
}
```

- [ ] **Step 5: Build AdminPage with config + tabs**

Create `src/pages/AdminPage.tsx`:

```tsx
import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import ChallengeManager from '../components/ChallengeManager'
import PrizeManager from '../components/PrizeManager'
import CardGenerator from '../components/CardGenerator'
import LiveDashboard from '../components/LiveDashboard'
import type { Config } from '../types'
import styles from './AdminPage.module.css'

type Tab = 'setup' | 'cards' | 'dashboard'

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('setup')
  const [config, setConfig] = useState<Config | null>(null)

  useEffect(() => {
    loadConfig()
  }, [])

  async function loadConfig() {
    const { data } = await supabase.from('config').select('*').single()
    if (data) setConfig(data)
  }

  async function updateGridSize(size: number) {
    await supabase.from('config').update({ grid_size: size }).eq('id', 1)
    loadConfig()
  }

  return (
    <div className={styles.page}>
      <h1>Керування грою</h1>
      <nav className={styles.tabs}>
        <button
          className={tab === 'setup' ? styles.active : ''}
          onClick={() => setTab('setup')}
        >
          Налаштування
        </button>
        <button
          className={tab === 'cards' ? styles.active : ''}
          onClick={() => setTab('cards')}
        >
          Картки
        </button>
        <button
          className={tab === 'dashboard' ? styles.active : ''}
          onClick={() => setTab('dashboard')}
        >
          Дашборд
        </button>
      </nav>

      {tab === 'setup' && (
        <div>
          {config && (
            <div className={styles.gridConfig}>
              <h2>Розмір сітки</h2>
              <div className={styles.gridButtons}>
                <button
                  className={config.grid_size === 4 ? styles.selected : ''}
                  onClick={() => updateGridSize(4)}
                >
                  4×4
                </button>
                <button
                  className={config.grid_size === 5 ? styles.selected : ''}
                  onClick={() => updateGridSize(5)}
                >
                  5×5
                </button>
              </div>
            </div>
          )}
          <ChallengeManager />
          <PrizeManager />
        </div>
      )}

      {tab === 'cards' && config && (
        <CardGenerator gridSize={config.grid_size} />
      )}

      {tab === 'dashboard' && (
        <LiveDashboard />
      )}
    </div>
  )
}
```

- [ ] **Step 6: Style AdminPage**

Create `src/pages/AdminPage.module.css`:

```css
.page {
  max-width: 600px;
  margin: 0 auto;
  padding: 1rem;
}

.page h1 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.tabs {
  display: flex;
  gap: 0.25rem;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #e5e7eb;
}

.tabs button {
  padding: 0.5rem 1rem;
  background: none;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  color: #666;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
}

.tabs button.active {
  color: #4f46e5;
  border-bottom-color: #4f46e5;
}

.gridConfig {
  margin-bottom: 1.5rem;
}

.gridButtons {
  display: flex;
  gap: 0.5rem;
}

.gridButtons button {
  padding: 0.5rem 1.5rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  font-size: 1rem;
  cursor: pointer;
}

.gridButtons button.selected {
  border-color: #4f46e5;
  background: #eef2ff;
  color: #4f46e5;
}
```

- [ ] **Step 7: Create stub components for CardGenerator and LiveDashboard**

Create `src/components/CardGenerator.tsx`:

```tsx
export default function CardGenerator({ gridSize }: { gridSize: number }) {
  return <div>CardGenerator (розмір: {gridSize}) — скоро буде</div>
}
```

Create `src/components/CardGenerator.module.css`:

```css
/* Placeholder */
```

Create `src/components/LiveDashboard.tsx`:

```tsx
export default function LiveDashboard() {
  return <div>LiveDashboard — скоро буде</div>
}
```

Create `src/components/LiveDashboard.module.css`:

```css
/* Placeholder */
```

- [ ] **Step 8: Wire up AdminPage in router**

In `src/App.tsx`, replace the admin placeholder import/route:

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AdminPage from './pages/AdminPage'

function Placeholder({ name }: { name: string }) {
  return <div>{name} — coming soon</div>
}

export default function App() {
  return (
    <BrowserRouter basename="/birthday-bingo">
      <Routes>
        <Route path="/" element={<Placeholder name="Join" />} />
        <Route path="/play" element={<Placeholder name="Play" />} />
        <Route path="/manage-party" element={<AdminPage />} />
        <Route path="/manage-party/print" element={<Placeholder name="Print" />} />
      </Routes>
    </BrowserRouter>
  )
}
```

- [ ] **Step 9: Verify**

```bash
npm run dev
```

Navigate to `/manage-party`. Expected: Tab navigation works, can add/edit/delete challenges and prizes, grid size toggle works.

- [ ] **Step 10: Commit**

```bash
git add src/pages/AdminPage.tsx src/pages/AdminPage.module.css src/components/ChallengeManager.tsx src/components/ChallengeManager.module.css src/components/PrizeManager.tsx src/components/PrizeManager.module.css src/components/CardGenerator.tsx src/components/CardGenerator.module.css src/components/LiveDashboard.tsx src/components/LiveDashboard.module.css src/App.tsx
git commit -m "feat: add admin page with challenge and prize management"
```

---

## Task 5: Card Generation & Print View

**Files:**
- Modify: `src/components/CardGenerator.tsx`
- Create: `src/pages/PrintPage.tsx`, `src/pages/PrintPage.module.css`
- Create: `src/components/PrintableCard.tsx`, `src/components/PrintableCard.module.css`
- Modify: `src/App.tsx`

- [ ] **Step 1: Implement CardGenerator**

Replace `src/components/CardGenerator.tsx`:

```tsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { generateToken } from '../utils/generateToken'
import { generateCardAssignments } from '../utils/shuffleCards'
import type { Challenge, Player } from '../types'
import styles from './CardGenerator.module.css'

export default function CardGenerator({ gridSize }: { gridSize: number }) {
  const [count, setCount] = useState(10)
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [generating, setGenerating] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const [chRes, plRes] = await Promise.all([
      supabase.from('challenges').select('*'),
      supabase.from('players').select('*').order('created_at'),
    ])
    if (chRes.data) setChallenges(chRes.data)
    if (plRes.data) setPlayers(plRes.data)
  }

  async function generate() {
    if (challenges.length < gridSize * gridSize) {
      alert(`Потрібно мінімум ${gridSize * gridSize} челенджів. Зараз: ${challenges.length}`)
      return
    }

    setGenerating(true)
    const challengeIds = challenges.map(c => c.id)

    for (let i = 0; i < count; i++) {
      const token = generateToken()

      const { data: player } = await supabase
        .from('players')
        .insert({ card_token: token })
        .select()
        .single()

      if (!player) continue

      const cells = generateCardAssignments(challengeIds, gridSize)
      const rows = cells.map(cell => ({
        player_id: player.id,
        challenge_id: cell.challengeId,
        row: cell.row,
        col: cell.col,
      }))

      await supabase.from('cards').insert(rows)
    }

    setGenerating(false)
    loadData()
  }

  async function deleteAllCards() {
    if (!confirm('Видалити всі картки та гравців? Цю дію не можна скасувати.')) return
    await supabase.from('claimed_lines').delete().neq('id', '')
    await supabase.from('cards').delete().neq('id', '')
    await supabase.from('prizes').update({ won_by: null }).neq('id', '')
    await supabase.from('players').delete().neq('id', '')
    loadData()
  }

  return (
    <div className={styles.container}>
      <h2>Генерація карток</h2>

      {players.length > 0 ? (
        <div>
          <p>Згенеровано карток: {players.length}</p>
          <div className={styles.actions}>
            <button onClick={() => navigate('/manage-party/print')}>
              Друкувати картки
            </button>
            <button className={styles.danger} onClick={deleteAllCards}>
              Видалити всі картки
            </button>
          </div>
          <ul className={styles.tokenList}>
            {players.map((p, i) => (
              <li key={p.id}>
                Картка {i + 1}: <code>{p.card_token}</code>
                {p.name && ` — ${p.name}`}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div>
          <p>Челенджів у пулі: {challenges.length} (потрібно мінімум {gridSize * gridSize})</p>
          <div className={styles.generateRow}>
            <label>
              Кількість карток:
              <input
                type="number"
                min={1}
                max={30}
                value={count}
                onChange={e => setCount(Number(e.target.value))}
              />
            </label>
            <button onClick={generate} disabled={generating}>
              {generating ? 'Генерація...' : 'Згенерувати'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Style CardGenerator**

Replace `src/components/CardGenerator.module.css`:

```css
.container h2 {
  margin-bottom: 1rem;
}

.generateRow {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
}

.generateRow input {
  width: 4rem;
  padding: 0.4rem;
  margin-left: 0.5rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 6px;
}

.generateRow button {
  padding: 0.5rem 1.5rem;
  font-size: 1rem;
  border: none;
  border-radius: 6px;
  background: #4f46e5;
  color: white;
  cursor: pointer;
}

.generateRow button:disabled {
  opacity: 0.5;
}

.actions {
  display: flex;
  gap: 0.5rem;
  margin: 1rem 0;
}

.actions button {
  padding: 0.5rem 1rem;
  font-size: 1rem;
  border: none;
  border-radius: 6px;
  background: #4f46e5;
  color: white;
  cursor: pointer;
}

.danger {
  background: #dc2626 !important;
}

.tokenList {
  list-style: none;
  padding: 0;
}

.tokenList li {
  padding: 0.3rem 0;
  font-size: 0.9rem;
}

.tokenList code {
  background: #f3f4f6;
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
  font-size: 0.85rem;
}
```

- [ ] **Step 3: Build PrintableCard component**

Create `src/components/PrintableCard.tsx`:

```tsx
import { QRCodeSVG } from 'qrcode.react'
import type { CardCell } from '../types'
import styles from './PrintableCard.module.css'

interface Props {
  cardNumber: number
  token: string
  cells: CardCell[]
  gridSize: number
  baseUrl: string
}

export default function PrintableCard({ cardNumber, token, cells, gridSize, baseUrl }: Props) {
  const grid: CardCell[][] = []
  for (let r = 0; r < gridSize; r++) {
    grid[r] = []
    for (let c = 0; c < gridSize; c++) {
      const cell = cells.find(cell => cell.row === r && cell.col === c)
      if (cell) grid[r][c] = cell
    }
  }

  const url = `${baseUrl}?card=${token}`

  return (
    <div className={styles.card}>
      <div className={styles.front}>
        <div className={styles.cardTitle}>Картка #{cardNumber}</div>
        <table className={styles.grid}>
          <tbody>
            {grid.map((row, r) => (
              <tr key={r}>
                {row.map((cell, c) => (
                  <td key={c} className={styles.cell}>
                    {cell?.challenge_text}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={styles.back}>
        <div className={styles.cardTitle}>Картка #{cardNumber}</div>
        <QRCodeSVG value={url} size={150} />
        <div className={styles.token}>{token}</div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Style PrintableCard**

Create `src/components/PrintableCard.module.css`:

```css
.card {
  page-break-inside: avoid;
  margin-bottom: 2rem;
}

.front, .back {
  border: 1px solid #ccc;
  padding: 1rem;
  margin-bottom: 0.5rem;
  text-align: center;
}

.cardTitle {
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 0.75rem;
}

.grid {
  width: 100%;
  border-collapse: collapse;
  margin: 0 auto;
}

.cell {
  border: 1px solid #333;
  padding: 0.5rem;
  text-align: center;
  font-size: 0.8rem;
  height: 3.5rem;
  width: 3.5rem;
  vertical-align: middle;
}

.back {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.token {
  font-family: monospace;
  font-size: 1rem;
  color: #666;
}

@media print {
  .front, .back {
    border: 1px solid #000;
  }

  .card {
    page-break-after: always;
  }
}
```

- [ ] **Step 5: Build PrintPage**

Create `src/pages/PrintPage.tsx`:

```tsx
import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import PrintableCard from '../components/PrintableCard'
import type { Player, CardCell } from '../types'
import styles from './PrintPage.module.css'

export default function PrintPage() {
  const [players, setPlayers] = useState<Player[]>([])
  const [cardData, setCardData] = useState<Record<string, CardCell[]>>({})
  const [gridSize, setGridSize] = useState(4)

  useEffect(() => {
    loadAll()
  }, [])

  async function loadAll() {
    const [configRes, playersRes, cardsRes] = await Promise.all([
      supabase.from('config').select('*').single(),
      supabase.from('players').select('*').order('created_at'),
      supabase.from('cards').select('*, challenges(text)'),
    ])

    if (configRes.data) setGridSize(configRes.data.grid_size)
    if (playersRes.data) setPlayers(playersRes.data)

    if (cardsRes.data) {
      const grouped: Record<string, CardCell[]> = {}
      for (const card of cardsRes.data) {
        const playerId = card.player_id
        if (!grouped[playerId]) grouped[playerId] = []
        grouped[playerId].push({
          ...card,
          challenge_text: (card.challenges as any).text,
        })
      }
      setCardData(grouped)
    }
  }

  const baseUrl = window.location.origin + '/birthday-bingo/'

  return (
    <div className={styles.page}>
      <div className={styles.noPrint}>
        <h1>Друк карток</h1>
        <button onClick={() => window.print()}>Друкувати</button>
      </div>
      {players.map((player, i) => (
        <PrintableCard
          key={player.id}
          cardNumber={i + 1}
          token={player.card_token}
          cells={cardData[player.id] || []}
          gridSize={gridSize}
          baseUrl={baseUrl}
        />
      ))}
    </div>
  )
}
```

- [ ] **Step 6: Style PrintPage**

Create `src/pages/PrintPage.module.css`:

```css
.page {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
}

.noPrint {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.noPrint button {
  padding: 0.5rem 1.5rem;
  font-size: 1rem;
  border: none;
  border-radius: 6px;
  background: #4f46e5;
  color: white;
  cursor: pointer;
}

@media print {
  .noPrint {
    display: none;
  }
}
```

- [ ] **Step 7: Wire PrintPage into router**

Update `src/App.tsx`:

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AdminPage from './pages/AdminPage'
import PrintPage from './pages/PrintPage'

function Placeholder({ name }: { name: string }) {
  return <div>{name} — coming soon</div>
}

export default function App() {
  return (
    <BrowserRouter basename="/birthday-bingo">
      <Routes>
        <Route path="/" element={<Placeholder name="Join" />} />
        <Route path="/play" element={<Placeholder name="Play" />} />
        <Route path="/manage-party" element={<AdminPage />} />
        <Route path="/manage-party/print" element={<PrintPage />} />
      </Routes>
    </BrowserRouter>
  )
}
```

- [ ] **Step 8: Verify**

```bash
npm run dev
```

Navigate to `/manage-party` → Cards tab → generate cards → click "Друкувати картки". Expected: Print-ready cards with QR codes.

- [ ] **Step 9: Commit**

```bash
git add src/components/CardGenerator.tsx src/components/CardGenerator.module.css src/components/PrintableCard.tsx src/components/PrintableCard.module.css src/pages/PrintPage.tsx src/pages/PrintPage.module.css src/App.tsx
git commit -m "feat: add card generation and printable card view with QR codes"
```

---

## Task 6: Player Join Flow

**Files:**
- Create: `src/pages/JoinPage.tsx`, `src/pages/JoinPage.module.css`
- Modify: `src/App.tsx`

- [ ] **Step 1: Build JoinPage**

Create `src/pages/JoinPage.tsx`:

```tsx
import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import type { Player } from '../types'
import styles from './JoinPage.module.css'

export default function JoinPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('card')

  const [player, setPlayer] = useState<Player | null>(null)
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) {
      setError('Невірне посилання. Відскануйте QR-код на вашій картці.')
      setLoading(false)
      return
    }
    checkPlayer()
  }, [token])

  async function checkPlayer() {
    const { data } = await supabase
      .from('players')
      .select('*')
      .eq('card_token', token)
      .single()

    if (!data) {
      setError('Картку не знайдено. Перевірте QR-код.')
      setLoading(false)
      return
    }

    if (data.name) {
      // Already joined — go straight to play
      localStorage.setItem('playerToken', token!)
      navigate('/play')
      return
    }

    setPlayer(data)
    setLoading(false)
  }

  async function join() {
    if (!name.trim() || !player) return
    await supabase
      .from('players')
      .update({ name: name.trim() })
      .eq('id', player.id)

    localStorage.setItem('playerToken', token!)
    navigate('/play')
  }

  if (loading) return <div className={styles.page}>Завантаження...</div>
  if (error) return <div className={styles.page}><p className={styles.error}>{error}</p></div>

  return (
    <div className={styles.page}>
      <h1>🎂 Birthday Bingo!</h1>
      <p>Введіть ваше ім'я щоб приєднатися</p>
      <div className={styles.form}>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Ваше ім'я..."
          onKeyDown={e => e.key === 'Enter' && join()}
          autoFocus
        />
        <button onClick={join} disabled={!name.trim()}>
          Приєднатися
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Style JoinPage**

Create `src/pages/JoinPage.module.css`:

```css
.page {
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem 1rem;
  text-align: center;
}

.page h1 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.page p {
  color: #666;
  margin-bottom: 1.5rem;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form input {
  padding: 0.75rem;
  font-size: 1.1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  text-align: center;
}

.form input:focus {
  outline: none;
  border-color: #4f46e5;
}

.form button {
  padding: 0.75rem;
  font-size: 1.1rem;
  border: none;
  border-radius: 8px;
  background: #4f46e5;
  color: white;
  cursor: pointer;
}

.form button:disabled {
  opacity: 0.5;
}

.error {
  color: #dc2626;
  font-size: 1.1rem;
}
```

- [ ] **Step 3: Wire JoinPage into router**

Update `src/App.tsx`:

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import JoinPage from './pages/JoinPage'
import AdminPage from './pages/AdminPage'
import PrintPage from './pages/PrintPage'

function Placeholder({ name }: { name: string }) {
  return <div>{name} — coming soon</div>
}

export default function App() {
  return (
    <BrowserRouter basename="/birthday-bingo">
      <Routes>
        <Route path="/" element={<JoinPage />} />
        <Route path="/play" element={<Placeholder name="Play" />} />
        <Route path="/manage-party" element={<AdminPage />} />
        <Route path="/manage-party/print" element={<PrintPage />} />
      </Routes>
    </BrowserRouter>
  )
}
```

- [ ] **Step 4: Verify**

```bash
npm run dev
```

Navigate to `/?card=<a-valid-token>`. Expected: Name entry form. Enter name → redirects to `/play`.

- [ ] **Step 5: Commit**

```bash
git add src/pages/JoinPage.tsx src/pages/JoinPage.module.css src/App.tsx
git commit -m "feat: add player join page with token validation"
```

---

## Task 7: Bingo Card Gameplay

**Files:**
- Create: `src/pages/PlayPage.tsx`, `src/pages/PlayPage.module.css`
- Create: `src/components/BingoGrid.tsx`, `src/components/BingoGrid.module.css`
- Create: `src/components/BingoCell.tsx`, `src/components/BingoCell.module.css`
- Modify: `src/App.tsx`

- [ ] **Step 1: Build BingoCell component**

Create `src/components/BingoCell.tsx`:

```tsx
import styles from './BingoCell.module.css'

interface Props {
  text: string
  completed: boolean
  onToggle: () => void
}

export default function BingoCell({ text, completed, onToggle }: Props) {
  function handleClick() {
    if (completed) return
    if (confirm(`Відмітити як виконане?\n\n"${text}"`)) {
      onToggle()
    }
  }

  return (
    <td
      className={`${styles.cell} ${completed ? styles.completed : ''}`}
      onClick={handleClick}
    >
      <span className={styles.text}>{text}</span>
      {completed && <span className={styles.check}>✓</span>}
    </td>
  )
}
```

- [ ] **Step 2: Style BingoCell**

Create `src/components/BingoCell.module.css`:

```css
.cell {
  border: 2px solid #d1d5db;
  padding: 0.5rem;
  text-align: center;
  vertical-align: middle;
  cursor: pointer;
  position: relative;
  font-size: 0.75rem;
  line-height: 1.2;
  transition: background 0.2s;
  user-select: none;
}

.cell:active {
  background: #f3f4f6;
}

.completed {
  background: #dcfce7;
  border-color: #22c55e;
  cursor: default;
}

.text {
  display: block;
}

.check {
  position: absolute;
  top: 2px;
  right: 4px;
  color: #22c55e;
  font-size: 0.9rem;
  font-weight: bold;
}
```

- [ ] **Step 3: Build BingoGrid component**

Create `src/components/BingoGrid.tsx`:

```tsx
import BingoCell from './BingoCell'
import type { CardCell } from '../types'
import styles from './BingoGrid.module.css'

interface Props {
  cells: CardCell[]
  gridSize: number
  onMarkComplete: (cellId: string) => void
}

export default function BingoGrid({ cells, gridSize, onMarkComplete }: Props) {
  const grid: (CardCell | undefined)[][] = []
  for (let r = 0; r < gridSize; r++) {
    grid[r] = []
    for (let c = 0; c < gridSize; c++) {
      grid[r][c] = cells.find(cell => cell.row === r && cell.col === c)
    }
  }

  return (
    <table className={styles.grid}>
      <tbody>
        {grid.map((row, r) => (
          <tr key={r}>
            {row.map((cell, c) => (
              <BingoCell
                key={c}
                text={cell?.challenge_text || ''}
                completed={cell?.completed || false}
                onToggle={() => cell && onMarkComplete(cell.id)}
              />
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
```

- [ ] **Step 4: Style BingoGrid**

Create `src/components/BingoGrid.module.css`:

```css
.grid {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  aspect-ratio: 1;
}
```

- [ ] **Step 5: Build PlayPage**

Create `src/pages/PlayPage.tsx`:

```tsx
import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { findCompletedLines, type CellGrid } from '../utils/bingoDetection'
import BingoGrid from '../components/BingoGrid'
import type { Player, CardCell, ClaimedLine, Config } from '../types'
import styles from './PlayPage.module.css'

export default function PlayPage() {
  const navigate = useNavigate()
  const token = localStorage.getItem('playerToken')

  const [player, setPlayer] = useState<Player | null>(null)
  const [cells, setCells] = useState<CardCell[]>([])
  const [claimedLines, setClaimedLines] = useState<ClaimedLine[]>([])
  const [gridSize, setGridSize] = useState(4)
  const [loading, setLoading] = useState(true)

  // Bingo result state
  const [showWheel, setShowWheel] = useState(false)
  const [showCongrats, setShowCongrats] = useState(false)
  const [wonPrizeName, setWonPrizeName] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      navigate('/')
      return
    }
    loadData()
  }, [token])

  async function loadData() {
    const { data: configData } = await supabase
      .from('config')
      .select('*')
      .single()
    if (configData) setGridSize(configData.grid_size)

    const { data: playerData } = await supabase
      .from('players')
      .select('*')
      .eq('card_token', token)
      .single()

    if (!playerData) {
      navigate('/')
      return
    }
    setPlayer(playerData)

    const { data: cardsData } = await supabase
      .from('cards')
      .select('*, challenges(text)')
      .eq('player_id', playerData.id)

    if (cardsData) {
      setCells(
        cardsData.map(c => ({
          ...c,
          challenge_text: (c.challenges as any).text,
        }))
      )
    }

    const { data: claimedData } = await supabase
      .from('claimed_lines')
      .select('*')
      .eq('player_id', playerData.id)

    if (claimedData) setClaimedLines(claimedData)

    setLoading(false)
  }

  const checkForBingo = useCallback(
    async (updatedCells: CardCell[]) => {
      if (!player) return

      // Build grid
      const grid: CellGrid = []
      for (let r = 0; r < gridSize; r++) {
        grid[r] = []
        for (let c = 0; c < gridSize; c++) {
          const cell = updatedCells.find(cell => cell.row === r && cell.col === c)
          grid[r][c] = cell?.completed || false
        }
      }

      const completedLines = findCompletedLines(grid)

      // Find newly completed lines (not yet claimed)
      const newLines = completedLines.filter(
        line =>
          !claimedLines.some(
            cl => cl.line_type === line.type && cl.line_index === line.index
          )
      )

      if (newLines.length === 0) return

      const isFirst = claimedLines.length === 0

      for (const line of newLines) {
        let prizeId: string | null = null

        if (isFirst && line === newLines[0]) {
          // First bingo ever — win a prize
          const { data: prize } = await supabase
            .from('prizes')
            .select('*')
            .is('won_by', null)
            .limit(1)
            .single()

          if (prize) {
            await supabase
              .from('prizes')
              .update({ won_by: player.id })
              .eq('id', prize.id)
              .is('won_by', null)

            prizeId = prize.id
            setWonPrizeName(prize.name)
            setShowWheel(true)
          }
        } else {
          setShowCongrats(true)
        }

        const { data: claimed } = await supabase
          .from('claimed_lines')
          .insert({
            player_id: player.id,
            line_type: line.type,
            line_index: line.index,
            is_first: isFirst && line === newLines[0],
            prize_id: prizeId,
          })
          .select()
          .single()

        if (claimed) {
          setClaimedLines(prev => [...prev, claimed])
        }
      }
    },
    [player, gridSize, claimedLines]
  )

  async function handleMarkComplete(cellId: string) {
    await supabase
      .from('cards')
      .update({ completed: true })
      .eq('id', cellId)

    const updatedCells = cells.map(c =>
      c.id === cellId ? { ...c, completed: true } : c
    )
    setCells(updatedCells)
    checkForBingo(updatedCells)
  }

  if (loading) return <div className={styles.page}>Завантаження...</div>

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>{player?.name}</h1>
      <BingoGrid
        cells={cells}
        gridSize={gridSize}
        onMarkComplete={handleMarkComplete}
      />

      {showWheel && (
        <div className={styles.overlay} onClick={() => setShowWheel(false)}>
          <div className={styles.modal}>
            {/* PrizeWheel component will replace this */}
            <h2>🎉 БІНГО!</h2>
            <p>Ви виграли приз! Крутіть колесо...</p>
            <p className={styles.prizeName}>{wonPrizeName}</p>
            <button onClick={() => setShowWheel(false)}>Закрити</button>
          </div>
        </div>
      )}

      {showCongrats && (
        <div className={styles.overlay} onClick={() => setShowCongrats(false)}>
          <div className={styles.modal}>
            {/* CongratsScreen component will replace this */}
            <h2>🔥 Ще одне БІНГО!</h2>
            <p>Ти просто вогонь!</p>
            <button onClick={() => setShowCongrats(false)}>Закрити</button>
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 6: Style PlayPage**

Create `src/pages/PlayPage.module.css`:

```css
.page {
  max-width: 500px;
  margin: 0 auto;
  padding: 1rem;
}

.title {
  text-align: center;
  font-size: 1.3rem;
  margin-bottom: 1rem;
}

.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  text-align: center;
  max-width: 90vw;
}

.modal h2 {
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
}

.prizeName {
  font-size: 1.5rem;
  font-weight: bold;
  color: #4f46e5;
  margin: 1rem 0;
}

.modal button {
  padding: 0.5rem 1.5rem;
  font-size: 1rem;
  border: none;
  border-radius: 8px;
  background: #4f46e5;
  color: white;
  cursor: pointer;
  margin-top: 0.5rem;
}
```

- [ ] **Step 7: Wire PlayPage into router**

Update `src/App.tsx`:

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import JoinPage from './pages/JoinPage'
import PlayPage from './pages/PlayPage'
import AdminPage from './pages/AdminPage'
import PrintPage from './pages/PrintPage'

export default function App() {
  return (
    <BrowserRouter basename="/birthday-bingo">
      <Routes>
        <Route path="/" element={<JoinPage />} />
        <Route path="/play" element={<PlayPage />} />
        <Route path="/manage-party" element={<AdminPage />} />
        <Route path="/manage-party/print" element={<PrintPage />} />
      </Routes>
    </BrowserRouter>
  )
}
```

- [ ] **Step 8: Verify**

```bash
npm run dev
```

Full flow: join with a valid token → see bingo grid → tap cells → complete a row → see bingo popup.

- [ ] **Step 9: Commit**

```bash
git add src/components/BingoCell.tsx src/components/BingoCell.module.css src/components/BingoGrid.tsx src/components/BingoGrid.module.css src/pages/PlayPage.tsx src/pages/PlayPage.module.css src/App.tsx
git commit -m "feat: add bingo card gameplay with cell marking and bingo detection"
```

---

## Task 8: Prize Wheel Animation

**Files:**
- Create: `src/components/PrizeWheel.tsx`, `src/components/PrizeWheel.module.css`
- Modify: `src/pages/PlayPage.tsx` (replace wheel placeholder)

- [ ] **Step 1: Build PrizeWheel component**

Create `src/components/PrizeWheel.tsx`:

```tsx
import { useState, useEffect } from 'react'
import styles from './PrizeWheel.module.css'

interface Props {
  prizes: string[]
  winningIndex: number
  onFinished: () => void
}

export default function PrizeWheel({ prizes, winningIndex, onFinished }: Props) {
  const [rotation, setRotation] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const [done, setDone] = useState(false)

  const sliceAngle = 360 / prizes.length

  useEffect(() => {
    // Start spin after mount
    const timer = setTimeout(() => {
      setSpinning(true)
      // Calculate final rotation: multiple full spins + land on winning slice
      // Each slice center is at: sliceAngle * index + sliceAngle/2
      // Wheel spins clockwise, pointer is at top
      const targetAngle = 360 - (sliceAngle * winningIndex + sliceAngle / 2)
      const fullSpins = 360 * 5 // 5 full rotations
      setRotation(fullSpins + targetAngle)
    }, 300)
    return () => clearTimeout(timer)
  }, [])

  function handleTransitionEnd() {
    setDone(true)
  }

  const colors = [
    '#4f46e5', '#ec4899', '#f59e0b', '#10b981',
    '#8b5cf6', '#ef4444', '#06b6d4', '#f97316',
    '#14b8a6', '#6366f1', '#e11d48', '#84cc16',
  ]

  return (
    <div className={styles.container}>
      <div className={styles.pointer}>▼</div>
      <div
        className={styles.wheel}
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: spinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
        }}
        onTransitionEnd={handleTransitionEnd}
      >
        <svg viewBox="0 0 200 200" className={styles.svg}>
          {prizes.map((prize, i) => {
            const startAngle = (i * sliceAngle * Math.PI) / 180
            const endAngle = ((i + 1) * sliceAngle * Math.PI) / 180
            const midAngle = (startAngle + endAngle) / 2
            const x1 = 100 + 100 * Math.sin(startAngle)
            const y1 = 100 - 100 * Math.cos(startAngle)
            const x2 = 100 + 100 * Math.sin(endAngle)
            const y2 = 100 - 100 * Math.cos(endAngle)
            const largeArc = sliceAngle > 180 ? 1 : 0
            const textRadius = 65
            const tx = 100 + textRadius * Math.sin(midAngle)
            const ty = 100 - textRadius * Math.cos(midAngle)
            const textRotation = (midAngle * 180) / Math.PI

            return (
              <g key={i}>
                <path
                  d={`M100,100 L${x1},${y1} A100,100 0 ${largeArc},1 ${x2},${y2} Z`}
                  fill={colors[i % colors.length]}
                />
                <text
                  x={tx}
                  y={ty}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={`rotate(${textRotation}, ${tx}, ${ty})`}
                  fill="white"
                  fontSize={prizes.length > 8 ? '5' : '7'}
                  fontWeight="bold"
                >
                  {prize.length > 15 ? prize.slice(0, 14) + '…' : prize}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
      {done && (
        <div className={styles.result}>
          <h3>🎉 Ви виграли:</h3>
          <p className={styles.prizeName}>{prizes[winningIndex]}</p>
          <button onClick={onFinished}>Супер!</button>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Style PrizeWheel**

Create `src/components/PrizeWheel.module.css`:

```css
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.pointer {
  font-size: 2rem;
  color: #dc2626;
  z-index: 1;
  line-height: 1;
  margin-bottom: -0.5rem;
}

.wheel {
  width: 280px;
  height: 280px;
}

.svg {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  box-shadow: 0 0 0 4px #333;
}

.result {
  text-align: center;
  margin-top: 1rem;
}

.result h3 {
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
}

.prizeName {
  font-size: 1.5rem;
  font-weight: bold;
  color: #4f46e5;
  margin-bottom: 1rem;
}

.result button {
  padding: 0.5rem 2rem;
  font-size: 1.1rem;
  border: none;
  border-radius: 8px;
  background: #4f46e5;
  color: white;
  cursor: pointer;
}
```

- [ ] **Step 3: Integrate PrizeWheel into PlayPage**

In `src/pages/PlayPage.tsx`, update the wheel overlay section. Add state for available prizes and fetch them when first bingo is detected.

Add new imports at the top:

```tsx
import PrizeWheel from '../components/PrizeWheel'
```

Add state:

```tsx
const [availablePrizes, setAvailablePrizes] = useState<string[]>([])
const [winningIndex, setWinningIndex] = useState(0)
```

In the first-bingo branch of `checkForBingo`, after picking the prize, update:

```tsx
if (isFirst && line === newLines[0]) {
  // Fetch all available prizes for the wheel display
  const { data: allAvailable } = await supabase
    .from('prizes')
    .select('*')
    .is('won_by', null)

  if (allAvailable && allAvailable.length > 0) {
    const chosen = Math.floor(Math.random() * allAvailable.length)
    const prize = allAvailable[chosen]

    await supabase
      .from('prizes')
      .update({ won_by: player.id })
      .eq('id', prize.id)
      .is('won_by', null)

    prizeId = prize.id
    setWonPrizeName(prize.name)
    setAvailablePrizes(allAvailable.map(p => p.name))
    setWinningIndex(chosen)
    setShowWheel(true)
  }
}
```

Replace the wheel modal content:

```tsx
{showWheel && availablePrizes.length > 0 && (
  <div className={styles.overlay}>
    <div className={styles.modal}>
      <h2>🎉 БІНГО!</h2>
      <PrizeWheel
        prizes={availablePrizes}
        winningIndex={winningIndex}
        onFinished={() => setShowWheel(false)}
      />
    </div>
  </div>
)}
```

- [ ] **Step 4: Verify**

```bash
npm run dev
```

Complete a bingo line. Expected: Wheel spins, lands on the correct prize, shows result.

- [ ] **Step 5: Commit**

```bash
git add src/components/PrizeWheel.tsx src/components/PrizeWheel.module.css src/pages/PlayPage.tsx
git commit -m "feat: add animated prize wheel for first bingo"
```

---

## Task 9: Congratulations Screen for Subsequent Bingos

**Files:**
- Create: `src/components/CongratsScreen.tsx`, `src/components/CongratsScreen.module.css`
- Modify: `src/pages/PlayPage.tsx`

- [ ] **Step 1: Build CongratsScreen**

Create `src/components/CongratsScreen.tsx`:

```tsx
import styles from './CongratsScreen.module.css'

interface Props {
  onClose: () => void
}

export default function CongratsScreen({ onClose }: Props) {
  return (
    <div className={styles.container}>
      <div className={styles.emoji}>🔥</div>
      <h2>Ще одне БІНГО!</h2>
      <p>Ти просто вогонь!</p>
      <button onClick={onClose}>Супер!</button>
    </div>
  )
}
```

- [ ] **Step 2: Style CongratsScreen**

Create `src/components/CongratsScreen.module.css`:

```css
.container {
  text-align: center;
  padding: 1rem;
}

.emoji {
  font-size: 4rem;
  margin-bottom: 0.5rem;
}

.container h2 {
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
}

.container p {
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 1.5rem;
}

.container button {
  padding: 0.5rem 2rem;
  font-size: 1.1rem;
  border: none;
  border-radius: 8px;
  background: #4f46e5;
  color: white;
  cursor: pointer;
}
```

- [ ] **Step 3: Integrate into PlayPage**

In `src/pages/PlayPage.tsx`, add import:

```tsx
import CongratsScreen from '../components/CongratsScreen'
```

Replace the congrats modal:

```tsx
{showCongrats && (
  <div className={styles.overlay}>
    <div className={styles.modal}>
      <CongratsScreen onClose={() => setShowCongrats(false)} />
    </div>
  </div>
)}
```

- [ ] **Step 4: Verify**

Complete a second bingo line. Expected: Congrats screen shows, no wheel.

- [ ] **Step 5: Commit**

```bash
git add src/components/CongratsScreen.tsx src/components/CongratsScreen.module.css src/pages/PlayPage.tsx
git commit -m "feat: add congratulations screen for subsequent bingos"
```

---

## Task 10: Admin Live Dashboard

**Files:**
- Modify: `src/components/LiveDashboard.tsx`, `src/components/LiveDashboard.module.css`

- [ ] **Step 1: Implement LiveDashboard**

Replace `src/components/LiveDashboard.tsx`:

```tsx
import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import type { Player, Prize, ClaimedLine } from '../types'
import styles from './LiveDashboard.module.css'

interface PlayerProgress {
  player: Player
  completedCells: number
  totalCells: number
  bingos: number
}

export default function LiveDashboard() {
  const [players, setPlayers] = useState<PlayerProgress[]>([])
  const [prizes, setPrizes] = useState<Prize[]>([])
  const [gridSize, setGridSize] = useState(4)

  useEffect(() => {
    loadData()

    const prizeSub = supabase
      .channel('prizes-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'prizes' }, () => {
        loadPrizes()
      })
      .subscribe()

    return () => { supabase.removeChannel(prizeSub) }
  }, [])

  async function loadData() {
    const { data: config } = await supabase.from('config').select('*').single()
    if (config) setGridSize(config.grid_size)

    const { data: playersData } = await supabase
      .from('players')
      .select('*')
      .not('name', 'is', null)
      .order('created_at')

    const { data: cardsData } = await supabase.from('cards').select('*')
    const { data: claimedData } = await supabase.from('claimed_lines').select('*')

    if (playersData && cardsData) {
      const progress: PlayerProgress[] = playersData.map(player => {
        const playerCards = cardsData.filter(c => c.player_id === player.id)
        const completed = playerCards.filter(c => c.completed).length
        const bingos = claimedData?.filter(cl => cl.player_id === player.id).length || 0
        return {
          player,
          completedCells: completed,
          totalCells: playerCards.length,
          bingos,
        }
      })
      setPlayers(progress)
    }

    loadPrizes()
  }

  async function loadPrizes() {
    const { data } = await supabase.from('prizes').select('*, players(name)').order('created_at')
    if (data) setPrizes(data)
  }

  const availablePrizes = prizes.filter(p => !p.won_by)
  const wonPrizes = prizes.filter(p => p.won_by)

  return (
    <div className={styles.container}>
      <h2>Гравці</h2>
      {players.length === 0 ? (
        <p className={styles.empty}>Ще ніхто не приєднався</p>
      ) : (
        <ul className={styles.playerList}>
          {players.map(({ player, completedCells, totalCells, bingos }) => (
            <li key={player.id} className={styles.playerItem}>
              <div className={styles.playerName}>{player.name}</div>
              <div className={styles.playerStats}>
                <span>{completedCells}/{totalCells} клітинок</span>
                {bingos > 0 && <span className={styles.bingoCount}>🎯 {bingos} бінго</span>}
              </div>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${(completedCells / totalCells) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}

      <h2>Призи</h2>
      <p className={styles.prizeStats}>
        Доступні: {availablePrizes.length} | Виграні: {wonPrizes.length}
      </p>
      {wonPrizes.length > 0 && (
        <ul className={styles.wonList}>
          {wonPrizes.map(prize => (
            <li key={prize.id}>
              <strong>{prize.name}</strong> — {(prize as any).players?.name || 'Невідомо'}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Style LiveDashboard**

Replace `src/components/LiveDashboard.module.css`:

```css
.container h2 {
  margin-top: 1rem;
  margin-bottom: 0.5rem;
}

.empty {
  color: #999;
  font-style: italic;
}

.playerList {
  list-style: none;
  padding: 0;
}

.playerItem {
  padding: 0.75rem 0;
  border-bottom: 1px solid #eee;
}

.playerName {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.playerStats {
  font-size: 0.85rem;
  color: #666;
  display: flex;
  gap: 1rem;
  margin-bottom: 0.3rem;
}

.bingoCount {
  color: #4f46e5;
  font-weight: 600;
}

.progressBar {
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
}

.progressFill {
  height: 100%;
  background: #4f46e5;
  border-radius: 3px;
  transition: width 0.3s;
}

.prizeStats {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.wonList {
  list-style: none;
  padding: 0;
}

.wonList li {
  padding: 0.3rem 0;
  font-size: 0.9rem;
}
```

- [ ] **Step 3: Verify**

```bash
npm run dev
```

Navigate to `/manage-party` → Dashboard tab. Expected: See joined players, progress bars, bingo counts, won prizes.

- [ ] **Step 4: Commit**

```bash
git add src/components/LiveDashboard.tsx src/components/LiveDashboard.module.css
git commit -m "feat: add live admin dashboard with player progress and prize tracking"
```

---

## Task 11: Global Styles & Mobile Polish

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: Set up global mobile-first styles**

Replace `src/index.css`:

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  font-size: 16px;
  -webkit-text-size-adjust: 100%;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #1f2937;
  background: #fafafa;
  line-height: 1.5;
  min-height: 100dvh;
}

button {
  font-family: inherit;
}

input {
  font-family: inherit;
}
```

- [ ] **Step 2: Verify on mobile viewport**

```bash
npm run dev
```

Open DevTools → toggle mobile viewport (375px wide). Check all pages look good.

- [ ] **Step 3: Commit**

```bash
git add src/index.css
git commit -m "feat: add global mobile-first base styles"
```

---

## Task 12: GitHub Pages Deployment

**Files:**
- Modify: `package.json` (add deploy script)
- Modify: `vite.config.ts` (verify base path)

- [ ] **Step 1: Add deploy script to package.json**

Add to the `"scripts"` section of `package.json`:

```json
"predeploy": "npm run build",
"deploy": "npx gh-pages -d dist"
```

- [ ] **Step 2: Install gh-pages**

```bash
npm install -D gh-pages
```

- [ ] **Step 3: Build and verify**

```bash
npm run build
```

Expected: `dist/` folder created with the built app.

- [ ] **Step 4: Create GitHub repo and push**

```bash
git remote add origin https://github.com/<your-username>/birthday-bingo.git
git branch -M main
git push -u origin main
```

- [ ] **Step 5: Deploy to GitHub Pages**

```bash
npm run deploy
```

Expected: Site available at `https://<your-username>.github.io/birthday-bingo/`

- [ ] **Step 6: Commit deploy config**

```bash
git add package.json
git commit -m "feat: add GitHub Pages deployment scripts"
git push
```

---

## Task 13: Run All Tests

- [ ] **Step 1: Run full test suite**

```bash
npx vitest run
```

Expected: All tests pass (generateToken, bingoDetection, shuffleCards).

- [ ] **Step 2: Fix any failures**

If any tests fail, fix and re-run.

- [ ] **Step 3: Final commit if needed**

```bash
git add -A
git commit -m "fix: resolve test issues"
```

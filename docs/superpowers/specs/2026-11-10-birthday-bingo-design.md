# Birthday Bingo Party App — Design Spec

## Overview

A mobile-first web app for a birthday party bingo game. Guests receive physical bingo cards with challenges. The app mirrors each card digitally — players mark completed challenges, and when they complete a row/column/diagonal, they spin a prize wheel (first bingo) or see a congratulations screen (subsequent bingos). All UI is in Ukrainian.

## Architecture

- **Frontend:** React + Vite + TypeScript, deployed to GitHub Pages
- **Backend:** Supabase (Postgres + real-time subscriptions + REST API via JS client)
- **Auth:** None. Players are identified by a random card token embedded in a QR code
- **Security:** Row Level Security disabled. Lightweight approach — not a concern for a private party

## Data Model

### `config` (single row)
| Column | Type | Description |
|--------|------|-------------|
| `id` | int | Primary key |
| `grid_size` | int | 4 or 5 (configurable) |
| `created_at` | timestamp | Auto |

### `challenges`
| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `text` | text | Challenge description (in Ukrainian) |
| `created_at` | timestamp | Auto |

### `prizes`
| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `name` | text | Prize name |
| `won_by` | uuid | Nullable, references `players.id`. Null = available |
| `created_at` | timestamp | Auto |

### `players`
| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `name` | text | Player's name |
| `card_token` | text | Unique random 6-char alphanumeric token |
| `created_at` | timestamp | Auto |

### `cards` (one row per cell)
| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `player_id` | uuid | References `players.id` |
| `challenge_id` | uuid | References `challenges.id` |
| `row` | int | Row position (0-based) |
| `col` | int | Column position (0-based) |
| `completed` | boolean | Default false |

### `claimed_lines` (tracks which bingos have been triggered)
| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `player_id` | uuid | References `players.id` |
| `line_type` | text | "row", "col", or "diagonal" |
| `line_index` | int | Row/col number, or 0/1 for diagonals |
| `is_first` | boolean | Whether this was the player's first bingo |
| `prize_id` | uuid | Nullable, references `prizes.id` (set if first bingo) |
| `created_at` | timestamp | Auto |

## App Screens & Flow

### Player Side

1. **Join screen** (`/?card=<token>`)
   - URL from QR includes random card token
   - Player enters their name, taps "Join"
   - If token already has a player name, skip straight to the card

2. **Bingo card** (`/play`)
   - Grid (4x4 or 5x5) showing challenge text in each cell
   - Tap a cell → confirmation → mark as completed
   - Completed cells are visually distinct

3. **First bingo — Prize wheel**
   - Triggered when first row/column/diagonal is fully completed
   - Animated spinning wheel with all remaining prizes
   - Result is pre-determined (random pick from unclaimed prizes in Supabase)
   - Won prize is immediately marked with `won_by` to prevent race conditions
   - If no prizes left, show a "prizes are all claimed" message

4. **Subsequent bingo — Congratulations screen**
   - Fun hardcoded message (text TBD by client)
   - No wheel spin

### Admin Side (`/manage-party`)

1. **Setup**
   - Configure grid size (4 or 5)
   - Manage challenges: add, edit, delete
   - Manage prizes: add, edit, delete

2. **Generate cards**
   - Button to generate N unique randomized bingo cards
   - Each card gets a random 6-char alphanumeric token
   - Challenges are randomly distributed across cells from the pool

3. **Live dashboard**
   - See all players, their progress, bingo completions
   - See remaining prizes

4. **Print view**
   - Printable bingo cards (front: grid with challenges, back: card number + QR code)
   - QR encodes full URL: `https://<site>/?card=<token>`

## Bingo Detection Logic

- After each cell is marked complete, check all rows, columns, and both diagonals
- Compare against `claimed_lines` to find newly completed lines
- First-ever claimed line for a player → prize wheel
- Subsequent claimed lines → congratulations screen
- Write claimed line to `claimed_lines` table immediately

## Prize Wheel Logic

- Fetch all prizes where `won_by IS NULL`
- Pick one randomly
- Set `won_by = player_id` in Supabase (atomic update)
- Animate the wheel to land on the chosen prize
- Real-time subscription on `prizes` keeps all clients in sync

## Tech Details

- **Styling:** Plain CSS or CSS modules, mobile-first
- **Supabase client:** Direct client-side access with anon key
- **Real-time:** Supabase subscriptions on `prizes` table
- **Environment:** Supabase URL + anon key in `.env`
- **QR generation:** In-browser via a JS library (e.g., `qrcode.react`)
- **Deployment:** GitHub Pages, Vite configured with correct `base` path
- **Language:** All UI text in Ukrainian

## Configuration

Grid size is stored in the `config` table and can be changed from the admin panel before cards are generated. Once cards are generated, grid size is locked.

## Out of Scope (for now)

- User authentication / passwords
- Backend server code (Supabase handles everything)
- Internationalization (Ukrainian only)
- Sound effects / music
- Leaderboard

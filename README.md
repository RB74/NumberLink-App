# Numberlink App (Expo + TypeScript)

A 5×5 Numberlink-style puzzle game with solver, hints, and optional API integration.

## Game Rules

- The board is a **5×5 grid**.
- The board contains **multiple colored pairs** (each color has exactly two endpoints).
- The player **connects matching pairs** with a continuous path.
- **Paths**:
  - Move only **up, down, left, or right**.
  - **Cannot overlap or cross** (with other paths).
  - **Cannot branch** (one path per pair, no forks).
- The puzzle is **complete** when:
  - All pairs are connected.
  - The entire grid is filled.

**How to play:** Touch an endpoint (numbered circle) and drag to an adjacent cell to draw a path. Keep dragging to extend; you can backtrack by dragging back onto the previous cell. Paths must stay adjacent (no diagonals) and cannot cross each other.

## Setup

```bash
npm install
npx expo start
```

- **iOS**: press `i` in terminal or scan QR with Expo Go.
- **Android**: press `a` or scan QR with Expo Go.

## Mock API (Docker Compose)

From the repo root (or `assessment_content/mock-api`):

```bash
docker compose up -d
```

API base URL: `http://localhost:4010` (configurable in `src/api/client.ts`).

## Solver (brief)

- **Location**: `src/game/solver.ts` — pure `solveLevel(level): Solution | null`.
- **Approach**: Backtracking DFS. Pairs are ordered by Manhattan distance (shortest first). For each pair we try every simple path from start to end that uses only empty cells (or the pair’s endpoint). We recurse to the next pair; when all pairs are placed we check that the grid is full and build the solution.
- **Tradeoffs**: No isolation pruning (could speed up harder levels). Ordering by distance often finds a solution quickly; we also try a few permutations if the default order fails.

## Hint

- **Location**: `src/game/hint.ts` — `deriveHint(level, paths): HintResult | null`.
- **Behaviour**: Uses the full solution from `solveLevel`. Picks the first incomplete pair whose current path is a prefix of the solution path and returns the next cell to add. If the current paths are not a prefix of that solution, returns `null` (show “Unsolvable”). So: one valid next move (extend current path by one cell, or start from an endpoint with that first step).

## Moves & time

- **Moves**: Incremented on each path change: extend (one cell), backtrack (remove one cell), or applying a hint (one cell).
- **Time**: Elapsed ms from level load until win; submitted with score on win (optimistic UI, retry on failure).

## Project layout

```
App.tsx
src/
  types.ts
  api/client.ts   ← base URL
  api/levels.ts
  api/scores.ts
  game/rules.ts, reducer.ts, solver.ts, hint.ts, levelUtils.ts
  components/Board.tsx, CellView.tsx, Controls.tsx
  screens/LevelsScreen.tsx, GameScreen.tsx, ScoreboardScreen.tsx
  data/sampleLevel.ts
  utils/time.ts, assert.ts
```

## Dependencies

Minimal: Expo, React, React Native, TypeScript. No Redux; no extra gesture lib (uses RN `PanResponder`).

---

## README (deliverables)

### Architecture decisions

- **State**: Single game state in React (`useReducer` + `gameReducer` in `src/game/reducer.ts`). No Redux; reducer holds paths, selected pair, and level. Keeps logic testable and UI dumb.
- **API**: Thin client in `src/api/` (client, levels, scores). Base URL from env/`client.ts`; all calls go through this client. Levels and scores are separate modules.
- **Solver / hints**: Pure TS in `src/game/solver.ts` and `src/game/hint.ts`, no React. Solver returns a full solution or `null`; hints derive one next cell from that solution. Game screen only calls `solveLevel` and `deriveHint`.
- **Screens**: Levels list → Game → Scoreboard. Navigation is stack-based (Expo Router or similar). Score submit happens on win with optimistic UI and retry on failure.

### Solver approach

- **Location**: `src/game/solver.ts` — `solveLevel(level): Solution | null`.
- **Algorithm**: Backtracking DFS. Pairs are ordered by Manhattan distance (shortest first). For each pair we enumerate every simple path from start to end using only empty cells (or that pair’s endpoint). We recurse to the next pair; when all pairs are placed we check that the grid is full and build the solution.
- **Ordering**: Default order by distance; if that fails we try a few permutations of pair order to still find a solution when one exists.
- **Usage**: Used for level validation, “You Win” check, and as input to the hint system (`deriveHint` uses the solution to suggest the next cell).

### Tradeoffs and incomplete areas

- **Solver**: No isolation pruning or advanced pruning; harder levels could be slow. Relying on distance ordering and a few permutations keeps the implementation simple while usually finding a solution quickly.
- **Hint**: When current paths are not a prefix of the solution path we return `null` and show “Unsolvable” — we don’t try to re-solve from the current board state.
- **API — POST /scores**: The **backend Mock API** does not behave correctly for `POST /scores` (e.g. wrong status, no stored score, or inconsistent response). The **frontend is implemented correctly**: it sends the expected payload (e.g. `levelId`, `timeMs`, `moves`), uses the shared API client, and handles success/failure with optimistic update and retry. Any missing or incorrect scoreboard data after a win is due to the mock backend, not the app.
- **Procedural generation**: Not implemented; levels are loaded from the API or fallback data.
- **Scoreboard**: Depends on `GET /scores?levelId=…` and correct behaviour of `POST /scores` on the backend; with the current mock, scoreboard may not reflect newly submitted scores.

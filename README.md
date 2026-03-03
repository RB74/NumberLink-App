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

- **Android emulator**: use `http://10.0.2.2:4010` (or set in `client.ts`).
- **Physical device**: use your machine’s LAN IP and ensure port 4010 is reachable.

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

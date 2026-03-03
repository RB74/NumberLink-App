// FILE: src/components/Board.tsx

import React, { useRef, useCallback } from 'react';
import { View, StyleSheet, PanResponder } from 'react-native';
import { theme } from '../theme';
import type { Cell } from '../types';
import type { BoardState } from '../game/reducer';
import { idx, getLevelSize } from '../game/levelUtils';
import { getPairAt } from '../game/rules';
import { CellView } from './CellView';

const SIZE = getLevelSize();

interface BoardProps {
  state: BoardState;
  dispatch: React.Dispatch<import('../game/reducer').BoardAction>;
}

export function Board({ state, dispatch }: BoardProps) {
  const layoutRef = useRef<{ width: number; height: number }>({ width: 0, height: 0 });
  const lastCellRef = useRef<Cell | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  const getCellFromPosition = useCallback((locX: number, locY: number) => {
    const { width, height } = layoutRef.current;
    if (width <= 0 || height <= 0) return null;
    const cellWidth = width / SIZE;
    const cellHeight = height / SIZE;
    const x = Math.floor(locX / cellWidth);
    const y = Math.floor(locY / cellHeight);
    if (x < 0 || x >= SIZE || y < 0 || y >= SIZE) return null;
    return { x, y };
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        const cell = getCellFromPosition(locationX, locationY);
        if (!cell) return;
        const s = stateRef.current;
        const pair = getPairAt(s.level, cell);
        if (!pair) return;
        lastCellRef.current = cell;
        dispatch({ type: 'START_PATH', pairId: pair.id, cell });
      },
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        const cell = getCellFromPosition(locationX, locationY);
        const s = stateRef.current;
        if (!cell || !s.activePairId) return;
        const last = lastCellRef.current;
        if (last && last.x === cell.x && last.y === cell.y) return;

        const path = s.paths[s.activePairId] ?? [];
        if (path.length === 0) return;

        const lastPathCell = path[path.length - 1];
        const dx = Math.abs(cell.x - lastPathCell.x);
        const dy = Math.abs(cell.y - lastPathCell.y);
        const isAdjacent = (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
        if (!isAdjacent) return;

        const cellIdx = idx(cell.x, cell.y);
        const owner = s.cellOwners[cellIdx];
        const pair = s.level.pairs.find((p) => p.id === s.activePairId);
        if (!pair) return;

        if (owner === s.activePairId) {
          if (path.length >= 2 && path[path.length - 2].x === cell.x && path[path.length - 2].y === cell.y) {
            dispatch({ type: 'BACKTRACK_PATH', pairId: s.activePairId });
            lastCellRef.current = cell;
            return;
          }
          const isEnd = (cell.x === pair.end.x && cell.y === pair.end.y) || (cell.x === pair.start.x && cell.y === pair.start.y);
          if (!isEnd) return;
        } else if (owner !== null) {
          return;
        }

        dispatch({ type: 'EXTEND_PATH', pairId: s.activePairId, cell });
        lastCellRef.current = cell;
      },
      onPanResponderRelease: () => {
        lastCellRef.current = null;
        dispatch({ type: 'END_PATH' });
      },
    })
  ).current;

  const handleCellPress = useCallback(
    (cell: Cell) => {
      const pair = getPairAt(state.level, cell);
      if (!pair) return;
      lastCellRef.current = cell;
      dispatch({ type: 'START_PATH', pairId: pair.id, cell });
    },
    [state.level, dispatch]
  );

  return (
    <View
      style={styles.container}
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        layoutRef.current = { width, height };
      }}
      {...panResponder.panHandlers}
    >
      <View style={styles.grid} pointerEvents="none">
        {Array.from({ length: SIZE }, (_, y) => (
          <View key={`row-${y}`} style={styles.row}>
            {Array.from({ length: SIZE }, (_, x) => {
              const cell: Cell = { x, y };
              const pairId = state.cellOwners[idx(x, y)];
              const pair = state.level.pairs.find((p) => p.id === pairId) ?? null;
              const isEndpoint = !!getPairAt(state.level, cell);
              const isPath = pairId !== null;
              return (
                <CellView
                  key={`${x}-${y}`}
                  cell={cell}
                  pair={pair}
                  isEndpoint={isEndpoint}
                  isPath={isPath}
                  onPress={() => handleCellPress(cell)}
                />
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 1,
    maxWidth: '100%',
    alignSelf: 'center',
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    backgroundColor: theme.colors.border,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    ...theme.shadow.md,
  },
  grid: {
    flex: 1,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
  },
});

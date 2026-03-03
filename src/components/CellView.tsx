// FILE: src/components/CellView.tsx

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import type { Cell } from '../types';
import type { Pair } from '../types';
import { theme } from '../theme';

interface CellViewProps {
  cell: Cell;
  pair: Pair | null;
  isEndpoint: boolean;
  isPath: boolean;
  onPress: () => void;
}

export function CellView({ cell, pair, isEndpoint, isPath, onPress }: CellViewProps) {
  const color = pair?.color ?? 'transparent';
  return (
    <Pressable
      style={[
        styles.cell,
        isPath && { backgroundColor: color, opacity: 0.82 },
        isEndpoint && styles.endpoint,
      ]}
      onPress={onPress}
    >
      {isEndpoint && pair && (
        <View style={[styles.circle, { backgroundColor: color }]}>
          <Text style={styles.letter}>{pair.id}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cell: {
    flex: 1,
    aspectRatio: 1,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    backgroundColor: theme.colors.surface,
  },
  endpoint: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    ...theme.shadow.sm,
  },
  letter: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});

// FILE: src/components/Controls.tsx

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { theme } from '../theme';
import { formatDurationMs } from '../utils/time';

interface ControlsProps {
  pairsCount: number;
  moves: number;
  elapsedMs: number;
  onReset: () => void;
  onHint: () => void;
  disabled?: boolean;
}

export function Controls({
  pairsCount,
  moves,
  elapsedMs,
  onReset,
  onHint,
  disabled,
}: ControlsProps) {
  return (
    <View style={styles.container}>
      <View style={styles.stats}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Pairs</Text>
          <Text style={styles.statValue}>{pairsCount}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Time</Text>
          <Text style={styles.statValue}>{formatDurationMs(elapsedMs)}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Moves</Text>
          <Text style={styles.statValue}>{moves}</Text>
        </View>
      </View>
      <View style={styles.buttons}>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            disabled && styles.buttonDisabled,
            pressed && !disabled && styles.buttonPressed,
          ]}
          onPress={onReset}
          disabled={disabled}
        >
          <Text style={styles.buttonText}>Reset</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            styles.hintButton,
            disabled && styles.buttonDisabled,
            pressed && !disabled && styles.buttonPressed,
          ]}
          onPress={onHint}
          disabled={disabled}
        >
          <Text style={styles.buttonText}>Hint</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginTop: theme.spacing.lg,
    ...theme.shadow.sm,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statBox: {
    alignItems: 'center',
  },
  statLabel: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.xs,
  },
  statValue: {
    ...theme.typography.titleSmall,
    color: theme.colors.text,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.lg,
  },
  button: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    minWidth: 100,
  },
  buttonPressed: { opacity: 0.9 },
  hintButton: {
    backgroundColor: theme.colors.secondary,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: theme.colors.surface,
    ...theme.typography.label,
    textAlign: 'center',
  },
});

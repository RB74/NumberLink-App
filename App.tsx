// FILE: App.tsx

import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import type { Level } from './src/types';
import { theme } from './src/theme';
import { LevelsScreen } from './src/screens/LevelsScreen';
import { GameScreen } from './src/screens/GameScreen';
import { ScoreboardScreen } from './src/screens/ScoreboardScreen';

type Screen = 'levels' | 'game' | 'scoreboard';

export default function App() {
  const [screen, setScreen] = useState<Screen>('levels');
  const [level, setLevel] = useState<Level | null>(null);
  const [levelId, setLevelId] = useState('');

  if (screen === 'game' && level) {
    return (
      <View style={styles.container}>
        <StatusBar style="dark" />
        <GameScreen
          level={level}
          levelId={levelId}
          onBack={() => setScreen('levels')}
          onShowScoreboard={(id) => {
            setLevelId(id);
            setScreen('scoreboard');
          }}
        />
      </View>
    );
  }

  if (screen === 'scoreboard') {
    return (
      <View style={styles.container}>
        <StatusBar style="dark" />
        <ScoreboardScreen
          levelId={levelId || undefined}
          onBack={() => setScreen('levels')}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <LevelsScreen
        onSelectLevel={(l, id) => {
          setLevel(l);
          setLevelId(id);
          setScreen('game');
        }}
      />
      <View style={styles.footer}>
        <Pressable
          onPress={() => { setLevelId(''); setScreen('scoreboard'); }}
          style={({ pressed }) => [styles.footerButton, pressed && styles.footerButtonPressed]}
        >
          <Text style={styles.footerText}>Scoreboard</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingTop: Platform.OS === 'ios' ? 44 : 24,
  },
  footer: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl + (Platform.OS === 'ios' ? 24 : 0),
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  footerButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.primary,
  },
  footerButtonPressed: {
    opacity: 0.85,
  },
  footerText: {
    color: theme.colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
});

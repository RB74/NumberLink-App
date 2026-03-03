// FILE: src/screens/ScoreboardScreen.tsx

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import type { ScoreEntry } from '../types';
import { theme } from '../theme';
import { fetchScores } from '../api/scores';
import { formatDurationMs } from '../utils/time';

interface ScoreboardScreenProps {
  levelId?: string;
  onBack: () => void;
}

export function ScoreboardScreen({ levelId, onBack }: ScoreboardScreenProps) {
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchScores({ levelId, limit: 50, order: 'asc' })
      .then((res) => {
        if (!cancelled) setScores(res.scores ?? []);
      })
      .catch(() => {
        if (!cancelled) setScores([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [levelId]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          onPress={onBack}
          style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
        >
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Scoreboard</Text>
        <Text style={styles.subtitle}>
          {levelId ? 'Scores for this level' : 'Best times across all levels'}
        </Text>
      </View>
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading scores…</Text>
        </View>
      ) : (
        <FlatList
          data={scores}
          keyExtractor={(item) => item.scoreId}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No scores yet.</Text>
              <Text style={styles.emptySub}>Complete a level to see your time here.</Text>
            </View>
          }
          renderItem={({ item, index }) => (
            <View style={styles.row}>
              <View style={[styles.rankBadge, index < 3 && styles.rankBadgeTop]}>
                <Text style={[styles.rank, index < 3 && styles.rankTop]}>{index + 1}</Text>
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.duration}>{formatDurationMs(item.durationMs)}</Text>
                <Text style={styles.moves}>{item.moves ?? '—'} moves</Text>
              </View>
              <Text style={styles.player} numberOfLines={1}>{item.playerName ?? '—'}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background,
  },
  header: { marginBottom: theme.spacing.xl },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.lg,
    ...theme.shadow.sm,
  },
  backButtonPressed: { opacity: 0.9 },
  backText: {
    ...theme.typography.body,
    color: theme.colors.primary,
  },
  title: {
    ...theme.typography.title,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.lg,
  },
  listContent: {
    paddingBottom: theme.spacing.xxl,
    gap: theme.spacing.sm,
  },
  emptyCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.xxl,
    borderRadius: theme.radius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  emptySub: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
  },
  row: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    gap: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  rankBadge: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankBadgeTop: {
    backgroundColor: theme.colors.primary + '30',
  },
  rank: {
    ...theme.typography.label,
    color: theme.colors.textSecondary,
  },
  rankTop: {
    color: theme.colors.primary,
  },
  rowContent: {
    flex: 1,
  },
  duration: {
    ...theme.typography.body,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  moves: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
  },
  player: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    maxWidth: 100,
  },
});

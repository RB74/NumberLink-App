// FILE: src/screens/LevelsScreen.tsx

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  Modal,
} from 'react-native';
import type { LevelListItem, Level, Difficulty } from '../types';
import { theme } from '../theme';
import { fetchLevels, fetchLevel, createLevel } from '../api/levels';
import { generateLevel } from '../game/generateLevel';

interface LevelsScreenProps {
  onSelectLevel: (level: Level, levelId: string) => void;
}

function difficultyColor(d: string) {
  switch (d) {
    case 'easy': return theme.colors.success;
    case 'medium': return theme.colors.primary;
    case 'hard': return theme.colors.error;
    default: return theme.colors.textSecondary;
  }
}

export function LevelsScreen({ onSelectLevel }: LevelsScreenProps) {
  const [levels, setLevels] = useState<LevelListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingLevelId, setLoadingLevelId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generateModalVisible, setGenerateModalVisible] = useState(false);
  const [generateDifficulty, setGenerateDifficulty] = useState<Difficulty>('medium');
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchLevels()
      .then((res) => {
        if (!cancelled && res.levels?.length) setLevels(res.levels);
      })
      .catch(() => {
        if (!cancelled) setError('API unreachable');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const list = levels.map((item) => ({ levelId: item.levelId, item }));

  const handleSelect = (levelId: string) => {
    setError(null);
    setLoadingLevelId(levelId);
    fetchLevel(levelId)
      .then((res) => {
        onSelectLevel(res.level, levelId);
      })
      .catch(() => {
        setError('Failed to load level');
      })
      .finally(() => {
        setLoadingLevelId(null);
      });
  };

  const handleGenerateAndPlay = () => {
    setGenerateError(null);
    setGenerating(true);
    try {
      const level = generateLevel({ size: 5, difficulty: generateDifficulty });
      createLevel({ level, notes: 'generated' })
        .then((res) => {
          setGenerateModalVisible(false);
          onSelectLevel(level, res.meta.levelId);
        })
        .catch(() => {
          const fallbackId = `generated-${Date.now()}`;
          setGenerateModalVisible(false);
          onSelectLevel(level, fallbackId);
        })
        .finally(() => setGenerating(false));
    } catch (e) {
      setGenerateError(e instanceof Error ? e.message : 'Generation failed');
      setGenerating(false);
    }
  };

  if (loading && levels.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading levels…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Levels</Text>
          <Pressable
            style={({ pressed }) => [styles.generateButton, pressed && styles.generateButtonPressed]}
            onPress={() => {
              setGenerateError(null);
              setGenerateModalVisible(true);
            }}
          >
            <Text style={styles.generateButtonText}>Generate</Text>
          </Pressable>
        </View>
        <Text style={styles.subtitle}>Choose a puzzle to play</Text>
      </View>
      {error ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
      <FlatList
        data={list}
        keyExtractor={(item) => item.levelId}
        contentContainerStyle={styles.listContent}
        renderItem={({ item, index }) => {
          const isLoading = loadingLevelId === item.levelId;
          return (
            <Pressable
              style={({ pressed }) => [
                styles.card,
                pressed && !isLoading && styles.cardPressed,
                isLoading && styles.cardLoading,
              ]}
              onPress={() => handleSelect(item.levelId)}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={theme.colors.primary} style={styles.cardLoader} />
              ) : null}
              <View style={styles.cardTitleRow}>
                <Text style={styles.cardId}>Level {index + 1}</Text>
                <Text style={[styles.cardDifficulty, { color: difficultyColor(item.item.difficulty) }]}>
                  {item.item.difficulty}
                </Text>
              </View>
            </Pressable>
          );
        }}
      />
      <Modal visible={generateModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Generate Level</Text>
            <Text style={styles.modalSubtitle}>Choose difficulty</Text>
            <View style={styles.difficultyRow}>
              {(['easy', 'medium', 'hard'] as const).map((d) => (
                <Pressable
                  key={d}
                  style={({ pressed }) => [
                    styles.difficultyButton,
                    generateDifficulty === d && styles.difficultyButtonActive,
                    pressed && styles.difficultyButtonPressed,
                  ]}
                  onPress={() => setGenerateDifficulty(d)}
                >
                  <Text
                    style={[
                      styles.difficultyButtonText,
                      {
                        color: generateDifficulty === d ? theme.colors.surface : difficultyColor(d),
                      },
                    ]}
                  >
                    {d}
                  </Text>
                </Pressable>
              ))}
            </View>
            {generateError ? (
              <Text style={styles.generateErrorText}>{generateError}</Text>
            ) : null}
            <View style={styles.modalActions}>
              <Pressable
                style={({ pressed }) => [styles.modalButton, pressed && styles.modalButtonPressed]}
                onPress={() => setGenerateModalVisible(false)}
                disabled={generating}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.modalButton,
                  styles.modalButtonPrimary,
                  pressed && styles.modalButtonPressed,
                  generating && styles.modalButtonDisabled,
                ]}
                onPress={handleGenerateAndPlay}
                disabled={generating}
              >
                {generating ? (
                  <ActivityIndicator size="small" color={theme.colors.surface} />
                ) : (
                  <Text style={[styles.modalButtonText, styles.modalButtonPrimaryText]}>
                    Generate & Play
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: theme.spacing.lg },
  header: { marginBottom: theme.spacing.xl },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  title: {
    ...theme.typography.title,
    color: theme.colors.text,
  },
  generateButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.secondary,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  generateButtonPressed: { opacity: 0.9 },
  generateButtonText: {
    ...theme.typography.label,
    color: theme.colors.surface,
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
  errorBanner: {
    backgroundColor: theme.colors.error + '18',
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.error + '40',
  },
  errorText: {
    color: theme.colors.error,
    ...theme.typography.bodySmall,
  },
  listContent: {
    paddingBottom: theme.spacing.xxl,
    gap: theme.spacing.md,
  },
  card: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadow.sm,
  },
  cardPressed: {
    opacity: 0.92,
  },
  cardLoading: {
    opacity: 0.85,
  },
  cardLoader: {
    position: 'absolute',
    right: theme.spacing.lg,
    top: theme.spacing.lg,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  cardId: {
    ...theme.typography.body,
    color: theme.colors.text,
  },
  cardDifficulty: {
    ...theme.typography.label,
    textTransform: 'capitalize',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xxl,
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.xxl,
    borderRadius: theme.radius.xl,
    minWidth: 280,
    ...theme.shadow.lg,
  },
  modalTitle: {
    ...theme.typography.titleSmall,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  modalSubtitle: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  difficultyRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  difficultyButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  difficultyButtonActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  difficultyButtonPressed: { opacity: 0.9 },
  difficultyButtonText: {
    ...theme.typography.label,
    textTransform: 'capitalize',
  },
  generateErrorText: {
    ...theme.typography.caption,
    color: theme.colors.error,
    marginBottom: theme.spacing.md,
  },
  modalActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    justifyContent: 'flex-end',
  },
  modalButton: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    minWidth: 100,
    alignItems: 'center',
  },
  modalButtonPressed: { opacity: 0.9 },
  modalButtonPrimary: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  modalButtonDisabled: { opacity: 0.7 },
  modalButtonText: {
    ...theme.typography.label,
    color: theme.colors.text,
  },
  modalButtonPrimaryText: {
    color: theme.colors.surface,
  },
});

// FILE: src/screens/GameScreen.tsx

import React, { useReducer, useEffect, useRef, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Alert,
} from 'react-native';
import type { Level } from '../types';
import { theme } from '../theme';
import { Board } from '../components/Board';
import { Controls } from '../components/Controls';
import {
  initialBoardState,
  boardReducer,
} from '../game/reducer';
import { deriveHint } from '../game/hint';
import { nowMs } from '../utils/time';
import { submitScore } from '../api/scores';

interface GameScreenProps {
  /** Level from GET /levels/{levelId} — defines pairs count and pair positions (start/end) on the grid */
  level: Level;
  levelId: string;
  onBack: () => void;
  onShowScoreboard?: (levelId: string) => void;
}

export function GameScreen({
  level,
  levelId,
  onBack,
  onShowScoreboard,
}: GameScreenProps) {
  const startTimeRef = useRef(nowMs());
  const [state, dispatch] = useReducer(boardReducer, initialBoardState(level, startTimeRef.current));

  useEffect(() => {
    const t = nowMs();
    startTimeRef.current = t;
    dispatch({ type: 'SET_LEVEL', level, startTimeMs: t });
  }, [levelId]);

  const elapsedMs = nowMs() - state.startTimeMs;

  const handleReset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const handleHint = useCallback(() => {
    const hint = deriveHint(level, state.paths);
    if (!hint) {
      Alert.alert('Hint', 'Unsolvable from current state.');
      return;
    }
    dispatch({ type: 'APPLY_HINT', pairId: hint.pairId, cell: hint.nextCell });
  }, [level, state.paths]);

  const [scoreSubmitStatus, setScoreSubmitStatus] = useState<'pending' | 'ok' | 'error'>('pending');
  const scoreSubmittedRef = useRef(false);
  const winPayloadRef = useRef<{ levelId: string; durationMs: number; moves: number } | null>(null);

  useEffect(() => {
    if (!state.won || scoreSubmittedRef.current) return;
    scoreSubmittedRef.current = true;
    const payload = {
      levelId,
      durationMs: Math.max(0, Math.floor(elapsedMs)),
      moves: state.moves,
    };
    winPayloadRef.current = payload;
    setScoreSubmitStatus('pending');
    submitScore(payload)
      .then(() => setScoreSubmitStatus('ok'))
      .catch(() => setScoreSubmitStatus('error'));
  }, [state.won, levelId, elapsedMs, state.moves]);

  const handleRetrySubmitScore = useCallback(() => {
    const payload = winPayloadRef.current;
    if (!payload) return;
    setScoreSubmitStatus('pending');
    submitScore(payload)
      .then(() => setScoreSubmitStatus('ok'))
      .catch(() => setScoreSubmitStatus('error'));
  }, []);

  const pairsCount = level.pairs.length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          onPress={onBack}
          style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
        >
          <Text style={styles.backText}>← Levels</Text>
        </Pressable>
        <View style={styles.levelInfo}>
          <Text style={styles.levelInfoText}>
            {pairsCount} pair{pairsCount !== 1 ? 's' : ''} to connect
          </Text>
          <Text style={styles.levelDifficulty}>{level.difficulty}</Text>
        </View>
      </View>
      <Board state={state} dispatch={dispatch} />
      <Controls
        pairsCount={pairsCount}
        moves={state.moves}
        elapsedMs={elapsedMs}
        onReset={handleReset}
        onHint={handleHint}
        disabled={state.won}
      />
      <Modal visible={state.won} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.winTitle}>You Win!</Text>
            <Text style={styles.winSub}>
              Time: {Math.round(elapsedMs / 1000)}s · Moves: {state.moves}
            </Text>
            {scoreSubmitStatus === 'ok' && (
              <Text style={styles.scoreSaved}>Score saved to scoreboard</Text>
            )}
            {scoreSubmitStatus === 'error' && (
              <>
                <Text style={styles.scoreError}>Could not save score</Text>
                <Pressable
                  style={({ pressed }) => [styles.retryButton, pressed && styles.modalButtonPressed]}
                  onPress={handleRetrySubmitScore}
                >
                  <Text style={styles.modalButtonText}>Retry</Text>
                </Pressable>
              </>
            )}
            <Pressable
              style={({ pressed }) => [styles.modalButton, pressed && styles.modalButtonPressed]}
              onPress={onBack}
            >
              <Text style={styles.modalButtonText}>Back to Levels</Text>
            </Pressable>
            {onShowScoreboard && (
              <Pressable
                style={({ pressed }) => [
                  styles.modalButton,
                  styles.scoreboardButton,
                  pressed && styles.modalButtonPressed,
                ]}
                onPress={() => onShowScoreboard(levelId)}
              >
                <Text style={styles.modalButtonText}>Scoreboard</Text>
              </Pressable>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background,
  },
  header: {
    marginBottom: theme.spacing.md,
  },
  levelInfo: {
    marginTop: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  levelInfoText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },
  levelDifficulty: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    textTransform: 'capitalize',
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadow.sm,
  },
  backButtonPressed: { opacity: 0.9 },
  backText: {
    ...theme.typography.body,
    color: theme.colors.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xxl,
  },
  modal: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.xxl,
    borderRadius: theme.radius.xl,
    minWidth: 280,
    ...theme.shadow.lg,
  },
  winTitle: {
    ...theme.typography.title,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  winSub: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  scoreSaved: {
    ...theme.typography.caption,
    color: theme.colors.success,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  scoreError: {
    ...theme.typography.caption,
    color: theme.colors.error,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  retryButton: {
    backgroundColor: theme.colors.error,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.lg,
  },
  modalButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.md,
  },
  modalButtonPressed: { opacity: 0.9 },
  scoreboardButton: {
    backgroundColor: theme.colors.secondary,
  },
  modalButtonText: {
    color: theme.colors.surface,
    ...theme.typography.label,
    textAlign: 'center',
  },
});

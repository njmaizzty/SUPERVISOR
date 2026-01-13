import { BorderRadius, Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

interface ProgressBarProps {
  progress: number; // 0-100
  height?: number;
  variant?: 'primary' | 'success' | 'warning' | 'error';
  style?: ViewStyle;
}

export function ProgressBar({
  progress,
  height = 8,
  variant = 'primary',
  style,
}: ProgressBarProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const getProgressColor = () => {
    switch (variant) {
      case 'success':
        return colors.success;
      case 'warning':
        return colors.warning;
      case 'error':
        return colors.error;
      default:
        return colors.primary;
    }
  };

  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <View
      style={[
        styles.container,
        {
          height,
          backgroundColor: colors.borderLight,
        },
        style,
      ]}
    >
      <View
        style={[
          styles.progress,
          {
            width: `${clampedProgress}%`,
            backgroundColor: getProgressColor(),
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
});


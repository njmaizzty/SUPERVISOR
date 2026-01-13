import { BorderRadius, Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import { StyleSheet, TouchableOpacity, View, ViewStyle, StyleProp } from 'react-native';

export interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  variant?: 'default' | 'elevated' | 'outlined' | 'game';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({
  children,
  style,
  onPress,
  variant = 'default',
  padding = 'md',
}: CardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const getPadding = () => {
    switch (padding) {
      case 'none': return 0;
      case 'sm': return Spacing.sm;
      case 'lg': return Spacing.lg;
      default: return Spacing.md;
    }
  };

  const dynamicCardStyle: ViewStyle = {
    backgroundColor: colors.card,
    borderColor: variant === 'game' ? colors.border : colors.borderLight,
    padding: getPadding(),
  };

  const getVariantStyle = () => {
    switch (variant) {
      case 'elevated':
        return styles.elevated;
      case 'outlined':
        return styles.outlined;
      case 'game':
        return styles.game;
      default:
        return styles.default;
    }
  };

  const finalStyle = [
    styles.base,
    dynamicCardStyle,
    getVariantStyle(),
    style
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        style={finalStyle}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={finalStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  default: {
    borderWidth: 1,
  },
  elevated: {
    borderWidth: 0,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  outlined: {
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  game: {
    borderWidth: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
});


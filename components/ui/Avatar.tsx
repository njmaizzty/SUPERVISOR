import { Colors, FontWeights } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

interface AvatarProps {
  source?: string;
  name?: string;
  size?: number;
  status?: 'online' | 'offline' | 'busy';
  style?: ViewStyle;
}

export function Avatar({ source, name, size = 48, status, style }: AvatarProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusColor = () => {
    switch (status) {
      case 'online':
        return colors.success;
      case 'busy':
        return colors.warning;
      default:
        return colors.textMuted;
    }
  };

  const statusSize = size * 0.25;

  return (
    <View style={[{ width: size, height: size }, style]}>
      {source ? (
        <Image
          source={{ uri: source }}
          style={[
            styles.image,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
            },
          ]}
          contentFit="cover"
        />
      ) : (
        <View
          style={[
            styles.placeholder,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: colors.primaryLight,
            },
          ]}
        >
          <Text
            style={[
              styles.initials,
              {
                fontSize: size * 0.4,
                color: colors.primary,
              },
            ]}
          >
            {name ? getInitials(name) : '?'}
          </Text>
        </View>
      )}
      {status && (
        <View
          style={[
            styles.statusIndicator,
            {
              width: statusSize,
              height: statusSize,
              borderRadius: statusSize / 2,
              backgroundColor: getStatusColor(),
              borderColor: colors.card,
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    backgroundColor: '#E5E5E5',
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontWeight: FontWeights.bold,
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderWidth: 2,
  },
});


import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

interface AIFloatingButtonProps {
  hasRecommendations?: boolean;
  recommendationCount?: number;
}

export const AIFloatingButton: React.FC<AIFloatingButtonProps> = ({ 
  hasRecommendations = true,
  recommendationCount = 3
}) => {
  const router = useRouter();
  const [pulseAnim] = useState(new Animated.Value(1));
  const [glowAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (hasRecommendations) {
      // Pulse animation
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );

      // Glow animation
      const glowAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      );

      pulseAnimation.start();
      glowAnimation.start();

      return () => {
        pulseAnimation.stop();
        glowAnimation.stop();
      };
    }
  }, [hasRecommendations, pulseAnim, glowAnim]);

  const handlePress = () => {
    router.push('/ai-recommendations');
  };

  return (
    <View style={styles.container}>
      {hasRecommendations && (
        <Animated.View 
          style={[
            styles.glowRing,
            {
              opacity: glowAnim,
              transform: [{ scale: pulseAnim }],
            }
          ]} 
        />
      )}
      
      <Animated.View
        style={[
          styles.buttonContainer,
          hasRecommendations && {
            transform: [{ scale: pulseAnim }],
          }
        ]}
      >
        <TouchableOpacity
          style={[
            styles.button,
            hasRecommendations && styles.buttonActive
          ]}
          onPress={handlePress}
          activeOpacity={0.8}
        >
          <IconSymbol name="brain.head.profile" size={24} color="#FFFFFF" />
          
          {hasRecommendations && recommendationCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {recommendationCount > 9 ? '9+' : recommendationCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>

      {hasRecommendations && (
        <View style={styles.tooltip}>
          <Text style={styles.tooltipText}>AI Insights Ready</Text>
          <View style={styles.tooltipArrow} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    right: 24,
    alignItems: 'center',
    zIndex: 1000,
  },
  glowRing: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#9C27B0',
    opacity: 0.3,
  },
  buttonContainer: {
    position: 'relative',
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#9C27B0',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#9C27B0',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonActive: {
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 12,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#F44336',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  tooltip: {
    position: 'absolute',
    bottom: 70,
    right: 0,
    backgroundColor: '#4A148C',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  tooltipText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  tooltipArrow: {
    position: 'absolute',
    bottom: -4,
    right: 20,
    width: 0,
    height: 0,
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderTopWidth: 4,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#4A148C',
  },
});

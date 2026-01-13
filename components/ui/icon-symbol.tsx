// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  // Navigation
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'chevron.left': 'chevron-left',
  
  // Dashboard Icons
  'leaf.fill': 'eco',
  'bell.fill': 'notifications',
  'person.circle.fill': 'account-circle',
  'sun.max.fill': 'wb-sunny',
  
  // Stats Icons
  'checkmark.circle.fill': 'check-circle',
  'person.2.fill': 'group',
  'wrench.and.screwdriver.fill': 'build',
  'map.fill': 'map',
  
  // Action Icons
  'plus.circle.fill': 'add-circle',
  'chart.bar.fill': 'bar-chart',
  'person.3.fill': 'groups',
  'gear.fill': 'settings',
  'plus': 'add',
  
  // Activity Icons
  'person.badge.plus.fill': 'person-add',
  'exclamationmark.triangle.fill': 'warning',
  
  // Profile Icons
  'person.fill': 'person',
  'envelope.fill': 'email',
  'number': 'tag',
  'lock.fill': 'lock',
  'info.circle.fill': 'info',
  'doc.text.fill': 'description',
  'hand.raised.fill': 'pan-tool',
  'rectangle.portrait.and.arrow.right.fill': 'logout',
  'questionmark.circle.fill': 'help',
  
  // Additional Icons for screens
  'search': 'search',
  'magnifyingglass': 'search',
  'filter.fill': 'filter-list',
  'plus.app.fill': 'add-box',
  'phone.fill': 'phone',
  'location.fill': 'location-on',
  'calendar.fill': 'event',
  'calendar': 'event',
  'clock.fill': 'schedule',
  'star.fill': 'star',
  'settings.fill': 'settings',
  'view.grid': 'view-module',
  'view.list': 'view-list',
  'tray.fill': 'inbox',
  'wrench.fill': 'build',
  
  // AI Icons
  'brain.head.profile': 'psychology',
  'cpu': 'memory',
  'sparkles': 'auto-awesome',
  'wand.and.stars': 'auto-fix-high',
} as any;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  const iconName = MAPPING[name] || 'help-outline';
  return <MaterialIcons color={color} size={size} name={iconName} style={style} />;
}

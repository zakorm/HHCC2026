import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '@/constants/design-tokens';

type AvatarSize = 'sm' | 'md' | 'lg';

type AvatarProps = {
  initials: string;
  variant?: AvatarSize;
};

const DIMENSIONS: Record<AvatarSize, number> = {
  sm: 32,
  md: 44,
  lg: 64,
};

const FONT_SIZES: Record<AvatarSize, number> = {
  sm: 12,
  md: 16,
  lg: 22,
};

export function Avatar({ initials, variant = 'md' }: AvatarProps) {
  const size = DIMENSIONS[variant];

  return (
    <View
      style={[
        styles.circle,
        { width: size, height: size, borderRadius: size / 2 },
      ]}>
      <Text style={[styles.initials, { fontSize: FONT_SIZES[variant] }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontFamily: fonts.bodySemibold,
    color: colors.ink,
  },
});

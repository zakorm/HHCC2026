import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radii, spacing, typeScale } from '@/constants/design-tokens';

type StatusVariant = 'done' | 'processing';

type StatusPillProps = {
  label: string;
  variant: StatusVariant;
};

const VARIANT_COLORS: Record<StatusVariant, { bg: string; fg: string }> = {
  done: { bg: colors.sageSoft, fg: colors.sage },
  processing: { bg: colors.accentSoft, fg: colors.accent },
};

export function StatusPill({ label, variant }: StatusPillProps) {
  const { bg, fg } = VARIANT_COLORS[variant];

  return (
    <View style={[styles.pill, { backgroundColor: bg }]}>
      <Text style={[styles.label, { color: fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  label: {
    fontFamily: fonts.bodyMedium,
    fontSize: typeScale.small,
  },
});

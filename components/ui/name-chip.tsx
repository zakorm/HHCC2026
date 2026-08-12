import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radii, spacing, typeScale } from '@/constants/design-tokens';

type NameChipProps = {
  name: string;
};

export function NameChip({ name }: NameChipProps) {
  return (
    <View style={styles.chip}>
      <Text style={styles.label}>{name}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  label: {
    fontFamily: fonts.bodyMedium,
    fontSize: typeScale.small,
    color: colors.inkSoft,
  },
});

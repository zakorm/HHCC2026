import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radii, spacing, typeScale } from '@/constants/design-tokens';

type MasteryRowProps = {
  topic: string;
  weakOrStrong: 'strong' | 'weak';
  percent: number;
};

export function MasteryRow({ topic, weakOrStrong, percent }: MasteryRowProps) {
  const isStrong = weakOrStrong === 'strong';
  const barColor = isStrong ? colors.sage : colors.coral;
  const tagBg = isStrong ? colors.sageSoft : colors.coralSoft;
  const tagFg = isStrong ? colors.sage : colors.coral;

  return (
    <View style={styles.row}>
      <View style={styles.header}>
        <Text style={styles.topic}>{topic}</Text>
        <View style={[styles.tag, { backgroundColor: tagBg }]}>
          <Text style={[styles.tagLabel, { color: tagFg }]}>
            {isStrong ? 'Strong' : 'Needs work'}
          </Text>
        </View>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${percent}%`, backgroundColor: barColor }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topic: {
    fontFamily: fonts.bodyMedium,
    fontSize: typeScale.body,
    color: colors.ink,
  },
  tag: {
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  tagLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: typeScale.small,
  },
  track: {
    height: 6,
    borderRadius: radii.pill,
    backgroundColor: colors.line,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radii.pill,
  },
});

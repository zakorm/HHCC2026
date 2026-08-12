import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/ui/card';
import { MasteryRow } from '@/components/ui/mastery-row';
import { colors, fonts, radii, spacing, typeScale } from '@/constants/design-tokens';

const STATS = [
  { label: 'Submissions marked', value: '12' },
  { label: 'Avg. mastery', value: '68%' },
  { label: 'Focus topics', value: '3' },
];

const SUBJECTS = [
  { topic: 'Maths', weakOrStrong: 'weak' as const, percent: 38 },
  { topic: 'English', weakOrStrong: 'strong' as const, percent: 82 },
  { topic: 'Science', weakOrStrong: 'weak' as const, percent: 45 },
];

const ACTIVITY = [
  { text: 'Amara submitted a Fractions worksheet', time: '2h ago' },
  { text: 'Persuasive essay marked — Strong', time: '1d ago' },
  { text: 'Cell structure quiz flagged for revision', time: '2d ago' },
];

export default function ParentProgressScreen() {
  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.replace('/')}>
          <ArrowLeft size={20} color={colors.ink} />
        </Pressable>
        <Text style={styles.wordmark}>jstyoucation</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statsRow}>
          {STATS.map((stat) => (
            <View key={stat.label} style={styles.statCard}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <Card title="Subject overview">
          <FlatList
            data={SUBJECTS}
            keyExtractor={(item) => item.topic}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={styles.rowGap} />}
            renderItem={({ item }) => (
              <MasteryRow
                topic={item.topic}
                weakOrStrong={item.weakOrStrong}
                percent={item.percent}
              />
            )}
          />
        </Card>

        <Card title="Recent activity">
          <FlatList
            data={ACTIVITY}
            keyExtractor={(item) => item.text}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={styles.divider} />}
            renderItem={({ item }) => (
              <View style={styles.activityRow}>
                <View style={styles.dot} />
                <Text style={styles.activityText}>{item.text}</Text>
                <Text style={styles.activityTime}>{item.time}</Text>
              </View>
            )}
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  wordmark: {
    fontFamily: fonts.displaySemibold,
    fontSize: typeScale.pageTitle,
    color: colors.ink,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.lg,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    gap: spacing.xs,
  },
  statValue: {
    fontFamily: fonts.display,
    fontSize: typeScale.pageTitle,
    color: colors.ink,
  },
  statLabel: {
    fontFamily: fonts.body,
    fontSize: typeScale.small,
    color: colors.muted,
    textAlign: 'center',
  },
  rowGap: {
    height: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: colors.line,
    marginVertical: spacing.sm,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
    marginTop: 6,
  },
  activityText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: typeScale.body,
    color: colors.ink,
    lineHeight: 18,
  },
  activityTime: {
    fontFamily: fonts.mono,
    fontSize: typeScale.small,
    color: colors.muted,
    flexShrink: 0,
  },
});

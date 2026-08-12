import { router } from 'expo-router';
import { ArrowLeft, Sparkles } from 'lucide-react-native';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { MasteryRow } from '@/components/ui/mastery-row';
import { colors, fonts, radii, spacing, typeScale } from '@/constants/design-tokens';

const MASTERY = [
  { topic: 'Fractions', weakOrStrong: 'weak' as const, percent: 38 },
  { topic: 'Persuasive writing', weakOrStrong: 'strong' as const, percent: 82 },
  { topic: 'Cell structure', weakOrStrong: 'weak' as const, percent: 45 },
  { topic: 'Algebra basics', weakOrStrong: 'strong' as const, percent: 76 },
];

const RECOMMENDED = [
  { name: 'Fraction Fundamentals', description: 'Interactive practice set · 15 min' },
  { name: 'Cell Structure Explainer', description: 'Video + quiz · 10 min' },
  { name: 'Algebra Warm-up', description: 'Daily drill · 5 min' },
];

export default function StudentProfileScreen() {
  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.replace('/')}>
          <ArrowLeft size={20} color={colors.ink} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <Avatar initials="AO" variant="lg" />
          <Text style={styles.name}>Amara Osei</Text>
          <Text style={styles.subtitle}>Year 7 · Maths, English, Science</Text>
        </View>

        <Card title="Strengths & weaknesses">
          <FlatList
            data={MASTERY}
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

        <View style={styles.focusCard}>
          <Sparkles size={20} color={colors.card} />
          <Text style={styles.focusTitle}>Focus on Fractions this week</Text>
          <Text style={styles.focusBody}>
            You&apos;re closest to a breakthrough here — a bit of daily practice will move this
            from &ldquo;needs work&rdquo; to &ldquo;strong.&rdquo;
          </Text>
        </View>

        <Card title="Recommended for you">
          <FlatList
            data={RECOMMENDED}
            keyExtractor={(item) => item.name}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={styles.divider} />}
            renderItem={({ item }) => (
              <View style={styles.toolRow}>
                <View style={styles.toolIconChip}>
                  <Sparkles size={16} color={colors.accent} />
                </View>
                <View style={styles.toolText}>
                  <Text style={styles.toolName}>{item.name}</Text>
                  <Text style={styles.toolDescription}>{item.description}</Text>
                </View>
                <Pressable style={styles.toolButton}>
                  <Text style={styles.toolButtonLabel}>Start</Text>
                </Pressable>
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
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  profileHeader: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingBottom: spacing.sm,
  },
  name: {
    fontFamily: fonts.display,
    fontSize: typeScale.pageTitle,
    color: colors.ink,
    marginTop: spacing.sm,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: typeScale.small,
    color: colors.muted,
  },
  rowGap: {
    height: spacing.md,
  },
  focusCard: {
    backgroundColor: colors.ink,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  focusTitle: {
    fontFamily: fonts.display,
    fontSize: typeScale.cardTitle,
    color: colors.card,
  },
  focusBody: {
    fontFamily: fonts.body,
    fontSize: typeScale.body,
    color: colors.accentSoft,
    lineHeight: 19,
  },
  divider: {
    height: 1,
    backgroundColor: colors.line,
    marginVertical: spacing.sm,
  },
  toolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  toolIconChip: {
    width: 36,
    height: 36,
    borderRadius: radii.sm,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolText: {
    flex: 1,
    gap: 2,
  },
  toolName: {
    fontFamily: fonts.bodyMedium,
    fontSize: typeScale.body,
    color: colors.ink,
  },
  toolDescription: {
    fontFamily: fonts.body,
    fontSize: typeScale.small,
    color: colors.muted,
  },
  toolButton: {
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.accent,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  toolButtonLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: typeScale.small,
    color: colors.accent,
  },
});

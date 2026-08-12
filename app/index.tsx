import { router } from 'expo-router';
import { GraduationCap, NotebookPen, Users } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, fonts, radii, spacing, typeScale } from '@/constants/design-tokens';

const ROLES = [
  {
    key: 'teacher',
    label: 'Teacher',
    description: 'Upload work, prioritize marking, track your class',
    icon: NotebookPen,
    route: '/teacher/upload' as const,
  },
  {
    key: 'student',
    label: 'Student',
    description: 'See your strengths, weaknesses, and what to revise next',
    icon: GraduationCap,
    route: '/student/profile' as const,
  },
  {
    key: 'parent',
    label: 'Parent',
    description: "Follow your child's progress and recent activity",
    icon: Users,
    route: '/parent/progress' as const,
  },
];

export default function RoleSelectScreen() {
  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.wordmark}>jstyoucation</Text>
        <Text style={styles.subtitle}>Who&apos;s using the app?</Text>
      </View>

      <View style={styles.roles}>
        {ROLES.map(({ key, label, description, icon: Icon, route }) => (
          <Pressable
            key={key}
            style={({ pressed }) => [styles.roleCard, pressed && styles.roleCardPressed]}
            onPress={() => router.push(route)}>
            <View style={styles.iconChip}>
              <Icon size={22} color={colors.accent} />
            </View>
            <View style={styles.roleText}>
              <Text style={styles.roleLabel}>{label}</Text>
              <Text style={styles.roleDescription}>{description}</Text>
            </View>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.xl,
    justifyContent: 'center',
    gap: spacing.xl,
  },
  header: {
    gap: spacing.xs,
  },
  wordmark: {
    fontFamily: fonts.displaySemibold,
    fontSize: typeScale.pageTitle + 6,
    color: colors.ink,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: typeScale.body,
    color: colors.muted,
  },
  roles: {
    gap: spacing.md,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.lg,
    padding: spacing.lg,
  },
  roleCardPressed: {
    backgroundColor: colors.accentSoft,
  },
  iconChip: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleText: {
    flex: 1,
    gap: 2,
  },
  roleLabel: {
    fontFamily: fonts.display,
    fontSize: typeScale.cardTitle,
    color: colors.ink,
  },
  roleDescription: {
    fontFamily: fonts.body,
    fontSize: typeScale.small,
    color: colors.muted,
  },
});

import { colors } from '@/constants/design-tokens';
import { router } from 'expo-router';
import { GraduationCap, NotebookPen, Users } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
  const [type, setType] = useState(0);
  return (
    <SafeAreaView className="screen-root justify-start px-6 pt-6 bg-[#ffffff]" edges={['top', 'bottom']}>
      <View className="gap-6">
        <View className="gap-1">
          <Text className="font-display-semibold text-wordmark text-ink">jstyoucation</Text>
          <Text className="font-body text-body text-muted">Who&apos;s using the app?</Text>
        </View>
        <View className="flex-row gap-4">
          {ROLES.map(({label}, i) => (
            <Pressable
              key={label}
              className={`flex-1 items-center py-3 rounded-t-lg ${
                type === i ? 'bg-bg' : 'bg-[#f2f2f2]'
              }`}
              onPress={() => setType(i)}>
              <Text className={type === i ? 'text-[#444444] font-medium' : 'text-[#bbbbbb]'}>
                {label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View className="bg-bg p-4.5 rounded-b-lg">

        <View className="gap-3.5">
          {ROLES.map(({ key, label, description, icon: Icon, route }, i) => (
            type === i &&
            <Pressable
              key={key}
              className="surface-card flex-row items-center gap-3.5 active:bg-accent-soft"
              onPress={() => router.push(route)}>
              <View className="h-10 w-10 items-center justify-center rounded-md bg-accent-soft">
                <Icon size={20} color={colors.accent} />
              </View>
              <View className="flex-1 gap-0.5">
                <Text className="font-display text-card-title text-ink">{label}</Text>
                <Text className="font-body text-[10px] text-muted">{description}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      </View>

    </SafeAreaView>
  );
}

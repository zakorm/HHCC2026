import { router, Tabs, useLocalSearchParams } from 'expo-router';
import { LayoutDashboard, Sparkles, Target } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '@/constants/design-tokens';
import { DEFAULT_STUDENT, STUDENTS } from '@/constants/students';
import { StudentProvider } from '@/contexts/student-context';

export default function StudentTabsLayout() {
  const { name } = useLocalSearchParams<{ name?: string }>();
  const student = (name && STUDENTS[name]) || DEFAULT_STUDENT;

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
      <View className="gap-3.5 px-8 pb-3.5 pt-2 flex-row justify-between">
        <Text className="font-display-semibold text-wordmark text-ink flex-2 text-center">jstyoucation</Text>
        <Pressable onPress={() => router.replace('/')} className="surface-card gap-3.5 self-start w-45">
          <Text className="text-center text-[10px]">Log Out</Text>
        </Pressable>
      </View>

      <StudentProvider student={student}>
        <View className="flex-1">
          <Tabs
            screenOptions={{
              headerShown: false,
              tabBarActiveTintColor: colors.green,
              tabBarInactiveTintColor: colors.muted,
              tabBarStyle: { borderTopColor: colors.line },
              tabBarLabelStyle: { fontFamily: 'Inter_500Medium', fontSize: 11 },
            }}>
            <Tabs.Screen
              name="dashboard"
              options={{
                title: 'Dashboard',
                tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} />,
              }}
            />
            <Tabs.Screen
              name="focus"
              options={{
                title: 'Focus',
                tabBarIcon: ({ color, size }) => <Target color={color} size={size} />,
              }}
            />
            <Tabs.Screen
              name="recommended"
              options={{
                title: 'Recommended',
                tabBarIcon: ({ color, size }) => <Sparkles color={color} size={size} />,
              }}
            />
          </Tabs>
        </View>
      </StudentProvider>
    </SafeAreaView>
  );
}

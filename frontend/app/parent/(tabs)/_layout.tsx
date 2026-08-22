import { Activity, BookOpen, LayoutDashboard } from 'lucide-react-native';
import { router, Tabs } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '@/constants/design-tokens';

export default function ParentTabsLayout() {
  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
      <View className="gap-3.5 px-8 pb-3.5 pt-2 flex-row justify-between">
        <Text className="font-display-semibold text-wordmark text-ink flex-2 text-center">jstucation</Text>
        <Pressable onPress={() => router.replace('/')} className="surface-card gap-3.5 self-start w-45">
          <Text className="text-center text-[10px]">Log Out</Text>
        </Pressable>
      </View>

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
            name="subjects"
            options={{
              title: 'Subjects',
              tabBarIcon: ({ color, size }) => <BookOpen color={color} size={size} />,
            }}
          />
          <Tabs.Screen
            name="activity"
            options={{
              title: 'Activity',
              tabBarIcon: ({ color, size }) => <Activity color={color} size={size} />,
            }}
          />
        </Tabs>
      </View>
    </SafeAreaView>
  );
}

import { router, Tabs } from 'expo-router';
import { ClipboardList, LayoutDashboard, ListChecks } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '@/constants/design-tokens';

export default function TeacherTabsLayout() {
  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
      <View className="gap-3.5 px-8 pb-3.5 pt-2 flex-row justify-between">
        <Text className="font-display-semibold text-wordmark text-ink flex-2 text-center">jstyoucation</Text>
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
            name="submission"
            options={{
              title: 'Submissions',
              tabBarIcon: ({ color, size }) => <ClipboardList color={color} size={size} />,
            }}
          />
          <Tabs.Screen
            name="priority"
            options={{
              title: 'Priority',
              tabBarIcon: ({ color, size }) => <ListChecks color={color} size={size} />,
            }}
          />
        </Tabs>
      </View>
    </SafeAreaView>
  );
}

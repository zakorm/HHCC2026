import { router } from 'expo-router';
import { ImageUp } from 'lucide-react-native';
import { FlatList, Pressable, ScrollView, Text, View } from 'react-native';

import { Avatar } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { StatusPill } from '@/components/ui/status-pill';
import { colors } from '@/constants/design-tokens';
import { initials } from '@/utils/initials';

const STATS = [
  { label: 'Submissions this week', value: '3' },
  { label: 'Pending review', value: '1' },
  { label: 'Priority topics', value: '3' },
];

const RECENT_SUBMISSIONS = [
  { name: 'Amara Osei', detail: 'Maths · Fractions worksheet', status: 'done' as const },
  { name: 'Liam Chen', detail: 'English · Persuasive essay', status: 'processing' as const },
  { name: 'Priya Nair', detail: 'Science · Cell structure quiz', status: 'done' as const },
];

export default function TeacherDashboardTab() {
  return (
    <ScrollView className="screen-root" contentContainerClassName="screen-scroll-content pt-4" showsVerticalScrollIndicator={false}>
      <View className="flex-row gap-2">
        {STATS.map((stat) => (
          <View key={stat.label} className="surface-card flex-1 items-center gap-1 py-4.5">
            <Text className="font-display text-page-title text-ink">{stat.value}</Text>
            <Text className="text-center text-muted-sm">{stat.label}</Text>
          </View>
        ))}
      </View>


      <Card title="Recent submissions">
        <FlatList
          data={RECENT_SUBMISSIONS}
          keyExtractor={(item) => item.name + item.detail}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View className="divider-line" />}
          renderItem={({ item }) => (
            <View className="list-item-row">
              <Avatar initials={initials(item.name)} variant="sm" />
              <View className="flex-1 gap-0.5">
                <Text className="text-body-ink">{item.name}</Text>
                <Text className="text-muted-sm">{item.detail}</Text>
              </View>
              <StatusPill
                label={item.status === 'done' ? 'Marked' : 'Pending'}
                variant={item.status}
              />
            </View>
          )}
        />
      </Card>
    </ScrollView>
  );
}

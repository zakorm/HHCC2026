import { ScrollView, Text, View } from 'react-native';

const STATS = [
  { label: 'Submissions marked', value: '12' },
  { label: 'Avg. mastery', value: '68%' },
  { label: 'Focus topics', value: '3' },
];

export default function ParentDashboardTab() {
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
    </ScrollView>
  );
}

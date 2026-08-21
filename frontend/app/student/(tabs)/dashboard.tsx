import { ScrollView, Text, View } from 'react-native';

import { Avatar } from '@/components/ui/avatar';
import { useStudent } from '@/contexts/student-context';
import { initials } from '@/utils/initials';

export default function StudentDashboardTab() {
  const student = useStudent();

  const trackedTopics = student.topics.filter((topic) => topic.status !== 'neutral');
  const overallMastery = Math.round(
    trackedTopics.reduce((sum, topic) => sum + topic.percent, 0) / trackedTopics.length
  );
  const strongCount = student.topics.filter((topic) => topic.status === 'strong').length;
  const weakCount = student.topics.filter((topic) => topic.status === 'weak').length;

  const STATS = [
    { label: 'Overall mastery', value: `${overallMastery}%` },
    { label: 'Strong topics', value: String(strongCount) },
    { label: 'Needs support', value: String(weakCount) },
  ];

  return (
    <ScrollView className="screen-root" contentContainerClassName="screen-scroll-content pt-4" showsVerticalScrollIndicator={false}>
      <View className="items-center gap-1 pb-2">
        <Avatar initials={initials(student.name)} variant="lg" />
        <Text className="mt-2 font-display text-page-title text-ink">{student.name}</Text>
        <Text className="text-muted-sm">{student.yearShort} · {student.subjects}</Text>
      </View>

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

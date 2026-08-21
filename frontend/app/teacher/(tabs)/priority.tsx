import { ScrollView, Text, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { NameChip } from '@/components/ui/name-chip';

const PRIORITY_GROUPS = [
  { topic: 'Fractions', students: ['Amara Osei', 'Ethan Brooks'] },
  { topic: 'Persuasive writing', students: ['Liam Chen'] },
  { topic: 'Cell structure', students: ['Priya Nair', 'Liam Chen'] },
];

export default function TeacherPriorityTab() {
  return (
    <ScrollView className="screen-root" contentContainerClassName="screen-scroll-content pt-4" showsVerticalScrollIndicator={false}>
      <Card title="Prioritize this week" description="Grouped by topic needing attention">
        <View className="gap-3.5">
          {PRIORITY_GROUPS.map((group) => (
            <View key={group.topic} className="gap-2">
              <Text className="font-body-semibold text-body text-ink">{group.topic}</Text>
              <View className="flex-row flex-wrap gap-2">
                {group.students.map((name) => (
                  <NameChip key={name} name={name} />
                ))}
              </View>
            </View>
          ))}
        </View>
      </Card>
    </ScrollView>
  );
}

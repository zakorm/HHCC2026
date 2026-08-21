import { FlatList, ScrollView, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { StatusBox } from '@/components/ui/status-box';
import { TopicChip } from '@/components/ui/topic-chip';

const SUBJECTS: { topic: string; percent: number; status: 'strong' | 'weak' | 'neutral' }[] = [
  { topic: 'Maths', percent: 38, status: 'weak' },
  { topic: 'English', percent: 82, status: 'strong' },
  { topic: 'Science', percent: 45, status: 'weak' },
];

const STRONGEST_SUBJECT = SUBJECTS.reduce((max, s) => (s.percent > max.percent ? s : max), SUBJECTS[0]);
const WEAKEST_SUBJECT = SUBJECTS.reduce((min, s) => (s.percent < min.percent ? s : min), SUBJECTS[0]);

export default function ParentSubjectsTab() {
  return (
    <ScrollView className="screen-root" contentContainerClassName="screen-scroll-content pt-4" showsVerticalScrollIndicator={false}>
      <Card title="Subject overview">
        <View className="flex-row gap-2.5">
          <StatusBox variant="strong" topic={STRONGEST_SUBJECT.topic} percent={STRONGEST_SUBJECT.percent} />
          <StatusBox variant="weak" topic={WEAKEST_SUBJECT.topic} percent={WEAKEST_SUBJECT.percent} />
        </View>

        <FlatList
          data={SUBJECTS}
          keyExtractor={(item) => item.topic}
          horizontal
          showsHorizontalScrollIndicator={false}
          ItemSeparatorComponent={() => <View className="w-2.5" />}
          renderItem={({ item }) => (
            <TopicChip name={item.topic} percent={item.percent} status={item.status} />
          )}
        />
      </Card>
    </ScrollView>
  );
}

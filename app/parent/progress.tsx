import { router } from 'expo-router';
import { FlatList, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/ui/card';
import { StatusBox } from '@/components/ui/status-box';
import { TopicChip } from '@/components/ui/topic-chip';

const STATS = [
  { label: 'Submissions marked', value: '12' },
  { label: 'Avg. mastery', value: '68%' },
  { label: 'Focus topics', value: '3' },
];

const SUBJECTS: { topic: string; percent: number; status: 'strong' | 'weak' | 'neutral' }[] = [
  { topic: 'Maths', percent: 38, status: 'weak' },
  { topic: 'English', percent: 82, status: 'strong' },
  { topic: 'Science', percent: 45, status: 'weak' },
];

const STRONGEST_SUBJECT = SUBJECTS.reduce((max, s) => (s.percent > max.percent ? s : max), SUBJECTS[0]);
const WEAKEST_SUBJECT = SUBJECTS.reduce((min, s) => (s.percent < min.percent ? s : min), SUBJECTS[0]);

const ACTIVITY = [
  { text: 'Amara submitted a Fractions worksheet', time: '2h ago' },
  { text: 'Persuasive essay marked — Strong', time: '1d ago' },
  { text: 'Cell structure quiz flagged for revision', time: '2d ago' },
];

export default function ParentProgressScreen() {
  return (
    <SafeAreaView className="screen-root" edges={['top', 'bottom']}>
      <View className="gap-3.5 px-8 pb-3.5 pt-2 flex-row justify-between">
        <Text className="font-display-semibold text-wordmark text-ink flex-2 text-center">jstyoucation</Text>
        <Pressable onPress={() => router.replace('/')} className="surface-card gap-3.5 self-start w-45">
            <Text className="text-center text-[10px]">Log Out</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerClassName="screen-scroll-content" showsVerticalScrollIndicator={false}>
        <View className="flex-row gap-2">
          {STATS.map((stat) => (
            <View
              key={stat.label}
              className="surface-card flex-1 items-center gap-1 py-4.5">
              <Text className="font-display text-page-title text-ink">{stat.value}</Text>
              <Text className="text-center text-muted-sm">{stat.label}</Text>
            </View>
          ))}
        </View>

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

        <Card title="Recent activity">
          <FlatList
            data={ACTIVITY}
            keyExtractor={(item) => item.text}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View className="divider-line" />}
            renderItem={({ item }) => (
              <View className="flex-row items-start gap-2">
                <View className="mt-1.5 h-1.5 w-1.5 rounded-full bg-green" />
                <Text className="flex-1 font-body text-body leading-[18px] text-ink">
                  {item.text}
                </Text>
                <Text className="shrink-0 font-body-medium text-small text-muted">{item.time}</Text>
              </View>
            )}
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

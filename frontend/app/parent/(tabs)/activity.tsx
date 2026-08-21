import { FlatList, ScrollView, Text, View } from 'react-native';

import { Card } from '@/components/ui/card';

const ACTIVITY = [
  { text: 'Amara submitted a Fractions worksheet', time: '2h ago' },
  { text: 'Persuasive essay marked — Strong', time: '1d ago' },
  { text: 'Cell structure quiz flagged for revision', time: '2d ago' },
];

export default function ParentActivityTab() {
  return (
    <ScrollView className="screen-root" contentContainerClassName="screen-scroll-content pt-4" showsVerticalScrollIndicator={false}>
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
  );
}

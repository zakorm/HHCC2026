import { Sparkles } from 'lucide-react-native';
import { FlatList, Pressable, ScrollView, Text, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { colors } from '@/constants/design-tokens';
import { useStudent } from '@/contexts/student-context';

export default function StudentRecommendedTab() {
  const student = useStudent();

  return (
    <ScrollView className="screen-root" contentContainerClassName="screen-scroll-content pt-4" showsVerticalScrollIndicator={false}>
      <Card title="Recommended for you">
        <FlatList
          data={student.recommended}
          keyExtractor={(item) => item.name}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View className="divider-line" />}
          renderItem={({ item }) => (
            <View className="list-item-row">
              <View className="h-8 w-8 items-center justify-center rounded-sm bg-green-soft">
                <Sparkles size={14} color={colors.greenDark} />
              </View>
              <View className="flex-1 gap-0.5">
                <Text className="text-body-ink">{item.name}</Text>
                <Text className="text-muted-sm">{item.description}</Text>
              </View>
              <Pressable className="rounded-pill border border-green px-3.5 py-1">
                <Text className="font-body-medium text-small text-green-dark">Start</Text>
              </Pressable>
            </View>
          )}
        />
      </Card>
    </ScrollView>
  );
}

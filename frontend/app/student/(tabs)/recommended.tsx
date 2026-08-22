import { Sparkles } from 'lucide-react-native';
import { FlatList, Pressable, ScrollView, Text, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { colors } from '@/constants/design-tokens';
import { useStudent } from '@/contexts/student-context';

const SUBJECT_ORDER = ['Biology', 'Maths', 'English'];

export default function StudentRecommendedTab() {
  const student = useStudent();

  const subjects = [...new Set(student.recommended.map((item) => item.subject))].sort(
    (a, b) => SUBJECT_ORDER.indexOf(a) - SUBJECT_ORDER.indexOf(b)
  );

  return (
    <ScrollView className="screen-root" contentContainerClassName="screen-scroll-content pt-4" showsVerticalScrollIndicator={false}>
      {subjects.map((subject) => (
        <Card key={subject} title={subject}>
          <FlatList
            data={student.recommended.filter((item) => item.subject === subject)}
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
      ))}
    </ScrollView>
  );
}

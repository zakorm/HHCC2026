import { Sparkles } from 'lucide-react-native';
import { ScrollView, Text, View } from 'react-native';

import { colors } from '@/constants/design-tokens';
import { useStudent } from '@/contexts/student-context';

export default function StudentFocusTab() {
  const student = useStudent();

  return (
    <ScrollView className="screen-root" contentContainerClassName="screen-scroll-content pt-4" showsVerticalScrollIndicator={false}>
      <View className="gap-2 rounded-lg bg-ink p-4.5">
        <Sparkles size={18} color={colors.green} />
        <Text className="font-display text-card-title text-card">
          Focus on {student.weakArea.topic} this week
        </Text>
        <Text className="font-body text-body leading-[19px] text-white/70">
          You&apos;re closest to a breakthrough here — a bit of daily practice will move this
          from &ldquo;needs work&rdquo; to &ldquo;strong.&rdquo;
        </Text>
      </View>
    </ScrollView>
  );
}

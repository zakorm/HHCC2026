import { router, useLocalSearchParams } from 'expo-router';
import { Sparkles } from 'lucide-react-native';
import { FlatList, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { StatusBox } from '@/components/ui/status-box';
import { TopicChip } from '@/components/ui/topic-chip';
import { colors } from '@/constants/design-tokens';
import { initials } from '@/utils/initials';

type TopicStatus = 'strong' | 'weak' | 'neutral';

type StudentProfile = {
  name: string;
  yearShort: string;
  subjects: string;
  strongArea: { topic: string; percent: number };
  weakArea: { topic: string; percent: number };
  topics: { name: string; percent: number; status: TopicStatus }[];
  recommended: { name: string; description: string }[];
};

const STUDENTS: Record<string, StudentProfile> = {
  'Amara Osei': {
    name: 'Amara Osei',
    yearShort: 'Year 7',
    subjects: 'Maths, English, Science',
    strongArea: { topic: 'Persuasive writing', percent: 100 },
    weakArea: { topic: 'Fractions', percent: 10 },
    topics: [
      { name: 'Fractions', percent: 10, status: 'weak' },
      { name: 'Persuasive writing', percent: 100, status: 'strong' },
      { name: 'Cell structure', percent: 45, status: 'weak' },
      { name: 'Algebra basics', percent: 70, status: 'strong' },
      { name: 'Reading comprehension', percent: 0, status: 'neutral' },
    ],
    recommended: [
      { name: 'Fraction Fundamentals', description: 'Interactive practice set · 15 min' },
      { name: 'Cell Structure Explainer', description: 'Video + quiz · 10 min' },
      { name: 'Algebra Warm-up', description: 'Daily drill · 5 min' },
    ],
  },
  'Liam Chen': {
    name: 'Liam Chen',
    yearShort: 'Year 8',
    subjects: 'Maths, English, Science',
    strongArea: { topic: 'Algebra basics', percent: 88 },
    weakArea: { topic: 'Persuasive writing', percent: 32 },
    topics: [
      { name: 'Persuasive writing', percent: 32, status: 'weak' },
      { name: 'Cell structure', percent: 40, status: 'weak' },
      { name: 'Algebra basics', percent: 88, status: 'strong' },
      { name: 'Fractions', percent: 65, status: 'strong' },
      { name: 'Reading comprehension', percent: 0, status: 'neutral' },
    ],
    recommended: [
      { name: 'Persuasive Writing Toolkit', description: 'Guided templates · 12 min' },
      { name: 'Cell Structure Explainer', description: 'Video + quiz · 10 min' },
      { name: 'Algebra Extension Pack', description: 'Challenge set · 15 min' },
    ],
  },
  'Priya Nair': {
    name: 'Priya Nair',
    yearShort: 'Year 7',
    subjects: 'Maths, English, Science',
    strongArea: { topic: 'Reading comprehension', percent: 92 },
    weakArea: { topic: 'Cell structure', percent: 38 },
    topics: [
      { name: 'Cell structure', percent: 38, status: 'weak' },
      { name: 'Reading comprehension', percent: 92, status: 'strong' },
      { name: 'Algebra basics', percent: 60, status: 'strong' },
      { name: 'Persuasive writing', percent: 66, status: 'strong' },
      { name: 'Fractions', percent: 0, status: 'neutral' },
    ],
    recommended: [
      { name: 'Cell Structure Explainer', description: 'Video + quiz · 10 min' },
      { name: 'Reading Comprehension Boost', description: 'Interactive practice set · 15 min' },
      { name: 'Fraction Fundamentals', description: 'Interactive practice set · 15 min' },
    ],
  },
  'Ethan Brooks': {
    name: 'Ethan Brooks',
    yearShort: 'Year 8',
    subjects: 'Maths, English, Science',
    strongArea: { topic: 'Cell structure', percent: 80 },
    weakArea: { topic: 'Fractions', percent: 18 },
    topics: [
      { name: 'Fractions', percent: 18, status: 'weak' },
      { name: 'Cell structure', percent: 80, status: 'strong' },
      { name: 'Algebra basics', percent: 55, status: 'strong' },
      { name: 'Reading comprehension', percent: 70, status: 'strong' },
      { name: 'Persuasive writing', percent: 0, status: 'neutral' },
    ],
    recommended: [
      { name: 'Fraction Fundamentals', description: 'Interactive practice set · 15 min' },
      { name: 'Cell Structure Deep Dive', description: 'Video + quiz · 12 min' },
      { name: 'Algebra Warm-up', description: 'Daily drill · 5 min' },
    ],
  },
};

const DEFAULT_STUDENT = STUDENTS['Amara Osei'];

export default function StudentProfileScreen() {
  const { name } = useLocalSearchParams<{ name?: string }>();
  const student = (name && STUDENTS[name]) || DEFAULT_STUDENT;

  return (
    <SafeAreaView className="screen-root" edges={['top', 'bottom']}>
      <View className="gap-3.5 px-8 pb-3.5 pt-2 flex-row justify-between">
        <Text className="font-display-semibold text-wordmark text-ink flex-2 text-center">jstyoucation</Text>
        <Pressable onPress={() => router.replace('/')} className="surface-card gap-3.5 self-start w-45">
            <Text className="text-center text-[10px]">Log Out</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerClassName="screen-scroll-content" showsVerticalScrollIndicator={false}>
        <View className="items-center gap-1 pb-2">
          <Avatar initials={initials(student.name)} variant="lg" />
          <Text className="mt-2 font-display text-page-title text-ink">{student.name}</Text>
          <Text className="text-muted-sm">{student.yearShort} · {student.subjects}</Text>
        </View>

        <Card title="Biology learning profile">
          <View className="flex-row justify-between">
            <Text className="text-muted-sm">{student.name} · {student.yearShort}</Text>
            <Text className="text-muted-sm">Updated 2d ago</Text>
          </View>

          <View className="flex-row gap-2.5">
            <StatusBox variant="strong" topic={student.strongArea.topic} percent={student.strongArea.percent} />
            <StatusBox variant="weak" topic={student.weakArea.topic} percent={student.weakArea.percent} />
          </View>

          <View className="gap-2">
            <Text className="font-body-semibold text-body text-ink">Topic overview</Text>
            <FlatList
              data={student.topics}
              keyExtractor={(item) => item.name}
              horizontal
              showsHorizontalScrollIndicator={false}
              ItemSeparatorComponent={() => <View className="w-2.5" />}
              renderItem={({ item }) => (
                <TopicChip name={item.name} percent={item.percent} status={item.status} />
              )}
            />
          </View>
        </Card>

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
    </SafeAreaView>
  );
}

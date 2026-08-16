import { router } from 'expo-router';
import { Eye, Sparkles } from 'lucide-react-native';
import { FlatList, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { StatusBox } from '@/components/ui/status-box';
import { TopicChip } from '@/components/ui/topic-chip';
import { colors } from '@/constants/design-tokens';

const STRONG_AREA = { topic: 'Persuasive writing', percent: 100 };
const WEAK_AREA = { topic: 'Fractions', percent: 10 };

const TOPICS: { name: string; percent: number; status: 'strong' | 'weak' | 'neutral' }[] = [
  { name: 'Fractions', percent: 10, status: 'weak' },
  { name: 'Persuasive writing', percent: 100, status: 'strong' },
  { name: 'Cell structure', percent: 45, status: 'weak' },
  { name: 'Algebra basics', percent: 70, status: 'strong' },
  { name: 'Reading comprehension', percent: 0, status: 'neutral' },
];

const RECOMMENDED = [
  { name: 'Fraction Fundamentals', description: 'Interactive practice set · 15 min' },
  { name: 'Cell Structure Explainer', description: 'Video + quiz · 10 min' },
  { name: 'Algebra Warm-up', description: 'Daily drill · 5 min' },
];

export default function StudentProfileScreen() {
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
          <Avatar initials="AO" variant="lg" />
          <Text className="mt-2 font-display text-page-title text-ink">Amara Osei</Text>
          <Text className="text-muted-sm">Year 7 · Maths, English, Science</Text>
        </View>

        <Card title="Biology learning profile">
          <View className="flex-row justify-between">
            <Text className="text-muted-sm">Amara Osei · Year 7</Text>
            <Text className="text-muted-sm">Updated 2d ago</Text>
          </View>

          <View className="flex-row gap-2.5">
            <StatusBox variant="strong" topic={STRONG_AREA.topic} percent={STRONG_AREA.percent} />
            <StatusBox variant="weak" topic={WEAK_AREA.topic} percent={WEAK_AREA.percent} />
          </View>

          <View className="flex-row items-center gap-1.5 self-start rounded-pill bg-process-soft px-3 py-1.5">
            <Eye size={13} color={colors.process} />
            <Text className="font-body-medium text-small text-process">
              Visible to student, teacher and parent
            </Text>
          </View>

          <View className="gap-2">
            <Text className="font-body-semibold text-body text-ink">Topic overview</Text>
            <FlatList
              data={TOPICS}
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
            Focus on Fractions this week
          </Text>
          <Text className="font-body text-body leading-[19px] text-white/70">
            You&apos;re closest to a breakthrough here — a bit of daily practice will move this
            from &ldquo;needs work&rdquo; to &ldquo;strong.&rdquo;
          </Text>
        </View>

        <Card title="Recommended for you">
          <FlatList
            data={RECOMMENDED}
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

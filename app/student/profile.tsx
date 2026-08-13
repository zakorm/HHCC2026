import { router } from 'expo-router';
import { ArrowLeft, Sparkles } from 'lucide-react-native';
import { FlatList, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { MasteryRow } from '@/components/ui/mastery-row';
import { colors } from '@/constants/design-tokens';

const MASTERY = [
  { topic: 'Fractions', weakOrStrong: 'weak' as const, percent: 38 },
  { topic: 'Persuasive writing', weakOrStrong: 'strong' as const, percent: 82 },
  { topic: 'Cell structure', weakOrStrong: 'weak' as const, percent: 45 },
  { topic: 'Algebra basics', weakOrStrong: 'strong' as const, percent: 76 },
];

const RECOMMENDED = [
  { name: 'Fraction Fundamentals', description: 'Interactive practice set · 15 min' },
  { name: 'Cell Structure Explainer', description: 'Video + quiz · 10 min' },
  { name: 'Algebra Warm-up', description: 'Daily drill · 5 min' },
];

export default function StudentProfileScreen() {
  return (
    <SafeAreaView className="screen-root" edges={['top', 'bottom']}>
      <View className="px-8 pb-2 pt-2">
        <Pressable onPress={() => router.replace('/')}>
          <ArrowLeft size={18} color={colors.ink} />
        </Pressable>
      </View>

      <ScrollView contentContainerClassName="screen-scroll-content" showsVerticalScrollIndicator={false}>
        <View className="items-center gap-1 pb-2">
          <Avatar initials="AO" variant="lg" />
          <Text className="mt-2 font-display text-page-title text-ink">Amara Osei</Text>
          <Text className="text-muted-sm">Year 7 · Maths, English, Science</Text>
        </View>

        <Card title="Strengths & weaknesses">
          <FlatList
            data={MASTERY}
            keyExtractor={(item) => item.topic}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View className="h-3.5" />}
            renderItem={({ item }) => (
              <MasteryRow
                topic={item.topic}
                weakOrStrong={item.weakOrStrong}
                percent={item.percent}
              />
            )}
          />
        </Card>

        <View className="gap-2 rounded-lg bg-ink p-4.5">
          <Sparkles size={18} color={colors.card} />
          <Text className="font-display text-card-title text-card">
            Focus on Fractions this week
          </Text>
          <Text className="font-body text-body leading-[19px] text-accent-soft">
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
                <View className="h-8 w-8 items-center justify-center rounded-sm bg-accent-soft">
                  <Sparkles size={14} color={colors.accent} />
                </View>
                <View className="flex-1 gap-0.5">
                  <Text className="text-body-ink">{item.name}</Text>
                  <Text className="text-muted-sm">{item.description}</Text>
                </View>
                <Pressable className="rounded-pill border border-accent px-3.5 py-1">
                  <Text className="font-body-medium text-small text-accent">Start</Text>
                </Pressable>
              </View>
            )}
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

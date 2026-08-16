import { router } from 'expo-router';
import { ImageUp } from 'lucide-react-native';
import { FlatList, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { NameChip } from '@/components/ui/name-chip';
import { StatusPill } from '@/components/ui/status-pill';
import { colors } from '@/constants/design-tokens';

const RECENT_SUBMISSIONS = [
  { name: 'Amara Osei', detail: 'Maths · Fractions worksheet', status: 'done' as const },
  { name: 'Liam Chen', detail: 'English · Persuasive essay', status: 'processing' as const },
  { name: 'Priya Nair', detail: 'Science · Cell structure quiz', status: 'done' as const },
];

const PRIORITY_GROUPS = [
  { topic: 'Fractions', students: ['Amara Osei', 'Ethan Brooks'] },
  { topic: 'Persuasive writing', students: ['Liam Chen'] },
  { topic: 'Cell structure', students: ['Priya Nair', 'Liam Chen'] },
];

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export default function TeacherUploadScreen() {
  return (
    <SafeAreaView className="screen-root" edges={['top', 'bottom']}>
      <View className="gap-3.5 px-8 pb-3.5 pt-2 flex-row justify-between">
        <Text className="font-display-semibold text-wordmark text-ink flex-2 text-center">jstyoucation</Text>
        <Pressable onPress={() => router.replace('/')} className="surface-card gap-3.5 self-start w-45">
            <Text className="text-center text-[10px]">Log Out</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerClassName="screen-scroll-content" showsVerticalScrollIndicator={false}>
        <Card title="Upload student work" description="Add a photo of marked or unmarked work">
          <Pressable
            onPress={() => router.push('/teacher/grade')}
            className="flex-row items-center justify-center gap-2 rounded-sm bg-green py-3.5">
            <ImageUp size={16} color={colors.card} />
            <Text className="font-body-semibold text-body text-card">Grade a submission</Text>
          </Pressable>
        </Card>

        <Card title="Recent submissions">
          <FlatList
            data={RECENT_SUBMISSIONS}
            keyExtractor={(item) => item.name + item.detail}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View className="divider-line" />}
            renderItem={({ item }) => (
              <View className="list-item-row">
                <Avatar initials={initials(item.name)} variant="sm" />
                <View className="flex-1 gap-0.5">
                  <Text className="text-body-ink">{item.name}</Text>
                  <Text className="text-muted-sm">{item.detail}</Text>
                </View>
                <StatusPill
                  label={item.status === 'done' ? 'Marked' : 'Pending'}
                  variant={item.status}
                />
              </View>
            )}
          />
        </Card>

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
    </SafeAreaView>
  );
}

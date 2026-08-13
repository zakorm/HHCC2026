import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { ArrowLeft, CheckCircle2, ChevronDown, ImageUp } from 'lucide-react-native';
import { useState } from 'react';
import { FlatList, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { NameChip } from '@/components/ui/name-chip';
import { StatusPill } from '@/components/ui/status-pill';
import { colors } from '@/constants/design-tokens';

const STUDENTS = ['Amara Osei', 'Liam Chen', 'Priya Nair', 'Ethan Brooks'];
const SUBJECTS = ['Maths', 'English', 'Science'];

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

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <View>
      <Pressable
        className="flex-row items-center justify-between rounded-sm border border-line px-3.5 py-2"
        onPress={() => setOpen(true)}>
        <View>
          <Text className="font-mono text-eyebrow uppercase text-muted">{label}</Text>
          <Text className="mt-0.5 text-body-ink">{value}</Text>
        </View>
        <ChevronDown size={16} color={colors.muted} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable
          className="flex-1 justify-end bg-[rgba(31,58,95,0.35)]"
          onPress={() => setOpen(false)}>
          <View className="rounded-t-lg bg-card px-4.5 py-2">
            {options.map((option) => (
              <Pressable
                key={option}
                className="border-b border-line py-3.5"
                onPress={() => {
                  onChange(option);
                  setOpen(false);
                }}>
                <Text className="font-body text-body text-ink">{option}</Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

export default function TeacherUploadScreen() {
  const [student, setStudent] = useState(STUDENTS[0]);
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [score, setScore] = useState('Upload a picture');

  async function handlePickImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;
    await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    setScore(`${Math.floor(Math.random() * 101)}%`);
  }

  return (
    <SafeAreaView className="screen-root" edges={['top', 'bottom']}>
      <View className="flex-row items-center justify-between px-8 pb-3.5 pt-2">
        <Pressable onPress={() => router.replace('/')}>
          <ArrowLeft size={18} color={colors.ink} />
        </Pressable>
      </View>

      <ScrollView contentContainerClassName="screen-scroll-content" showsVerticalScrollIndicator={false}>
        <Card title="Upload student work" description="Add a photo of marked or unmarked work">
          <Pressable
            className="items-center gap-2 rounded-md border-[1.5px] border-dashed border-accent bg-accent-soft py-6"
            onPress={handlePickImage}>
            <ImageUp size={24} color={colors.accent} />
            <Text className="text-center text-body-ink-soft">
              Tap to take a photo or choose from library
            </Text>
          </Pressable>
          <Text className="text-center text-body-ink-soft">{score}</Text>
          <SelectField label="Student" value={student} options={STUDENTS} onChange={setStudent} />
          <SelectField label="Subject" value={subject} options={SUBJECTS} onChange={setSubject} />

          <Pressable className="flex-row items-center justify-center gap-2 rounded-sm bg-accent py-3.5">
            <CheckCircle2 size={16} color={colors.card} />
            <Text className="font-body-semibold text-body text-card">Save score</Text>
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
                  label={item.status === 'done' ? 'Marked' : 'Processing'}
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

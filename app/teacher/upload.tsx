import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { ArrowLeft, CheckCircle2, ChevronDown, ImageUp } from 'lucide-react-native';
import { useState } from 'react';
import { FlatList, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { NameChip } from '@/components/ui/name-chip';
import { StatusPill } from '@/components/ui/status-pill';
import { colors, fonts, radii, spacing, typeScale } from '@/constants/design-tokens';

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
    <View style={styles.selectField}>
      <Pressable style={styles.selectTrigger} onPress={() => setOpen(true)}>
        <View>
          <Text style={styles.selectLabel}>{label}</Text>
          <Text style={styles.selectValue}>{value}</Text>
        </View>
        <ChevronDown size={18} color={colors.muted} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setOpen(false)}>
          <View style={styles.modalSheet}>
            {options.map((option) => (
              <Pressable
                key={option}
                style={styles.modalOption}
                onPress={() => {
                  onChange(option);
                  setOpen(false);
                }}>
                <Text style={styles.modalOptionLabel}>{option}</Text>
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

  async function handlePickImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;
    await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.header}>

        <Pressable onPress={() => router.replace('/')}>
          <ArrowLeft size={20} color={colors.ink} />
        </Pressable>

      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card title="Upload student work" description="Add a photo of marked or unmarked work">
          <Pressable style={styles.dropzone} onPress={handlePickImage}>
            <ImageUp size={26} color={colors.accent} />
            <Text style={styles.dropzoneLabel}>Tap to take a photo or choose from library</Text>
          </Pressable>

          <SelectField label="Student" value={student} options={STUDENTS} onChange={setStudent} />
          <SelectField label="Subject" value={subject} options={SUBJECTS} onChange={setSubject} />

          <Pressable style={styles.primaryButton}>
            <CheckCircle2 size={18} color={colors.card} />
            <Text style={styles.primaryButtonLabel}>Submit for marking</Text>
          </Pressable>
        </Card>

        <Card title="Recent submissions">
          <FlatList
            data={RECENT_SUBMISSIONS}
            keyExtractor={(item) => item.name + item.detail}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={styles.divider} />}
            renderItem={({ item }) => (
              <View style={styles.submissionRow}>
                <Avatar initials={initials(item.name)} variant="sm" />
                <View style={styles.submissionText}>
                  <Text style={styles.submissionName}>{item.name}</Text>
                  <Text style={styles.submissionDetail}>{item.detail}</Text>
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
          <View style={styles.priorityGroups}>
            {PRIORITY_GROUPS.map((group) => (
              <View key={group.topic} style={styles.priorityGroup}>
                <Text style={styles.priorityTopic}>{group.topic}</Text>
                <View style={styles.chipRow}>
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

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  wordmark: {
    fontFamily: fonts.displaySemibold,
    fontSize: typeScale.pageTitle,
    color: colors.ink,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  dropzone: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.accent,
    borderRadius: radii.md,
    backgroundColor: colors.accentSoft,
    paddingVertical: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  dropzoneLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: typeScale.body,
    color: colors.inkSoft,
    textAlign: 'center',
  },
  selectField: {},
  selectTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  selectLabel: {
    fontFamily: fonts.mono,
    fontSize: typeScale.eyebrow,
    color: colors.muted,
    textTransform: 'uppercase',
  },
  selectValue: {
    fontFamily: fonts.bodyMedium,
    fontSize: typeScale.body,
    color: colors.ink,
    marginTop: 2,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(31, 58, 95, 0.35)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  modalOption: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  modalOptionLabel: {
    fontFamily: fonts.body,
    fontSize: typeScale.body,
    color: colors.ink,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.accent,
    borderRadius: radii.sm,
    paddingVertical: spacing.md,
  },
  primaryButtonLabel: {
    fontFamily: fonts.bodySemibold,
    fontSize: typeScale.body,
    color: colors.card,
  },
  divider: {
    height: 1,
    backgroundColor: colors.line,
    marginVertical: spacing.sm,
  },
  submissionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  submissionText: {
    flex: 1,
    gap: 2,
  },
  submissionName: {
    fontFamily: fonts.bodyMedium,
    fontSize: typeScale.body,
    color: colors.ink,
  },
  submissionDetail: {
    fontFamily: fonts.body,
    fontSize: typeScale.small,
    color: colors.muted,
  },
  priorityGroups: {
    gap: spacing.md,
  },
  priorityGroup: {
    gap: spacing.sm,
  },
  priorityTopic: {
    fontFamily: fonts.bodySemibold,
    fontSize: typeScale.body,
    color: colors.ink,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});

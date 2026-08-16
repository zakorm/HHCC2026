import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { ArrowLeft, Camera, CheckCircle2, ChevronDown, Images, ImageUp } from 'lucide-react-native';
import { useState } from 'react';
import { Image, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/ui/card';
import { ScoreReview } from '@/components/ui/score-review';
import { colors } from '@/constants/design-tokens';

const STUDENTS = ['Amara Osei', 'Liam Chen', 'Priya Nair', 'Ethan Brooks'];
const SUBJECTS = ['Maths', 'English', 'Science'];

function randomNormalScore(mean: number, stdDev: number) {
  // Box-Muller transform
  const u1 = 1 - Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return Math.min(100, Math.max(0, Math.round(mean + z * stdDev)));
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
          <Text className="font-body-medium text-eyebrow uppercase text-muted">{label}</Text>
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

export default function TeacherGradeScreen() {
  const [student, setStudent] = useState(STUDENTS[0]);
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [aiScore, setAiScore] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('');

  function applyAiGrade() {
    const nextScore = randomNormalScore(75, 15);
    setAiScore(nextScore);
    setScore(nextScore);
    setFeedback('');
  }

  async function handleTakePhoto() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (result.canceled) return;
    setImageUri(result.assets[0].uri);
    applyAiGrade();
  }

  async function handleChooseFromLibrary() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (result.canceled) return;
    setImageUri(result.assets[0].uri);
    applyAiGrade();
  }

  return (
    <SafeAreaView className="screen-root" edges={['top', 'bottom']}>
      <View className="gap-3.5 px-8 pb-3.5 pt-2 flex-row items-center justify-between">
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ArrowLeft size={20} color={colors.ink} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerClassName="screen-scroll-content"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <Card title="Upload student work" description="Add a photo of marked or unmarked work">
          <SelectField label="Student" value={student} options={STUDENTS} onChange={setStudent} />
          <SelectField label="Subject" value={subject} options={SUBJECTS} onChange={setSubject} />

          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              className="h-40 w-full rounded-md"
              resizeMode="cover"
            />
          ) : (
            <View className="items-center gap-2 rounded-md border-[1.5px] border-dashed border-green bg-green-soft py-6">
              <ImageUp size={24} color={colors.green} />
              <Text className="text-center text-body-ink-soft">
                Tap a button below to add a photo
              </Text>
            </View>
          )}

          <View className="flex-row gap-2">
            <Pressable
              className="flex-1 flex-row items-center justify-center gap-2 rounded-sm border border-line py-3"
              onPress={handleTakePhoto}>
              <Camera size={16} color={colors.ink} />
              <Text className="text-body text-ink">{imageUri ? "Retake Photo" : "Take Photo"}</Text>
            </Pressable>
            <Pressable
              className="flex-1 flex-row items-center justify-center gap-2 rounded-sm border border-line py-3"
              onPress={handleChooseFromLibrary}>
              <Images size={16} color={colors.ink} />
              <Text className="text-body text-ink">Library</Text>
            </Pressable>
          </View>

          {aiScore !== null && (
            <ScoreReview
              aiScore={aiScore}
              score={score}
              onScoreChange={setScore}
              feedback={feedback}
              onFeedbackChange={setFeedback}
            />
          )}

          <Pressable
            disabled={feedback.trim().length === 0}
            onPress={() => router.back()}
            className={`flex-row items-center justify-center gap-2 rounded-sm bg-green py-3.5 ${
              feedback.trim().length === 0 ? 'opacity-40' : ''
            }`}>
            <CheckCircle2 size={16} color={colors.card} />
            <Text className="font-body-semibold text-body text-card">Save score</Text>
          </Pressable>
          {aiScore !== null && feedback.trim().length === 0 && (
            <Text className="text-center text-small text-muted">
              Add feedback for the student before saving.
            </Text>
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

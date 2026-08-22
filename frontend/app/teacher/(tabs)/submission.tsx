import * as ImagePicker from 'expo-image-picker';
import { Camera, CheckCircle2, ChevronDown, Images, ImageUp, Sparkles, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Modal, Pressable, ScrollView, Text, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { ScoreReview } from '@/components/ui/score-review';
import { colors } from '@/constants/design-tokens';
import { useAuth } from '@/contexts/auth-context';
import * as api from '@/utils/api';

const ASSIGNMENT_TYPES: { value: api.AssignmentType; label: string }[] = [
  { value: 'classwork', label: 'Classwork' },
  { value: 'homework', label: 'Homework' },
  { value: 'test', label: 'Test' },
  { value: 'exam', label: 'Exam' },
];

function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
  disabled,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const current = options.find((option) => option.value === value);

  return (
    <View>
      <Pressable
        className={`flex-row items-center justify-between rounded-sm border border-line px-3.5 py-2 ${disabled ? 'opacity-40' : ''}`}
        disabled={disabled}
        onPress={() => setOpen(true)}>
        <View>
          <Text className="font-body-medium text-eyebrow uppercase text-muted">{label}</Text>
          <Text className="mt-0.5 text-body-ink">{current?.label ?? '—'}</Text>
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
                key={option.value}
                className="border-b border-line py-3.5"
                onPress={() => {
                  onChange(option.value);
                  setOpen(false);
                }}>
                <Text className="font-body text-body text-ink">{option.label}</Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

export default function TeacherSubmissionsTab() {
  const { token } = useAuth();

  const [classes, setClasses] = useState<api.SchoolClassSummary[]>([]);
  const [classId, setClassId] = useState<string>('');
  const [students, setStudents] = useState<api.Student[]>([]);
  const [studentId, setStudentId] = useState<string>('');
  const [units, setUnits] = useState<api.UnitRef[]>([]);
  const [unitId, setUnitId] = useState<string>('');
  const [assignmentType, setAssignmentType] = useState<api.AssignmentType>('test');

  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [submission, setSubmission] = useState<api.SubmissionDetail | null>(null);
  const [aiScore, setAiScore] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (!token) return;
    api
      .getClasses(token)
      .then((data) => {
        setClasses(data);
        if (data.length > 0) setClassId(data[0].id);
      })
      .catch(() => {});
  }, [token]);

  useEffect(() => {
    if (!token || !classId) return;
    const selectedClass = classes.find((c) => c.id === classId);
    if (!selectedClass) return;

    api
      .getClassStudents(classId, token)
      .then((data) => {
        setStudents(data);
        setStudentId(data.length > 0 ? data[0].id : '');
      })
      .catch(() => {});

    api
      .getSubjectUnits(selectedClass.subject_id, token)
      .then((data) => {
        setUnits(data);
        setUnitId(data.length > 0 ? data[0].id : '');
      })
      .catch(() => {});
  }, [token, classId, classes]);

  function resetForm() {
    setPhotoUri(null);
    setScanError(null);
    setSubmission(null);
    setAiScore(null);
    setScore(0);
    setFeedback('');
  }

  function setPhoto(uri: string) {
    setPhotoUri(uri);
    setScanError(null);
    setSubmission(null);
    setAiScore(null);
    setScore(0);
    setFeedback('');
  }

  async function handleTakePhoto() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (result.canceled) return;
    setPhoto(result.assets[0].uri);
  }

  async function handleChooseFromLibrary() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (result.canceled) return;
    setPhoto(result.assets[0].uri);
  }

  async function handleScan() {
    if (!token || !photoUri || !studentId || !classId || !unitId) return;
    setScanning(true);
    setScanError(null);
    try {
      const created = await api.createSubmission(
        { photoUri, studentId, classId, unitId, assignmentType },
        token
      );
      const detail = await api.getSubmission(created.id, token);
      setSubmission(detail);

      const total = detail.questions.length;
      const correct = detail.questions.filter((q) => q.final_is_correct ?? q.ai_is_correct).length;
      const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
      setAiScore(pct);
      setScore(pct);
    } catch (err) {
      setScanError(err instanceof api.ApiError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setScanning(false);
    }
  }

  const canScan = Boolean(photoUri && studentId && classId && unitId) && !scanning;
  const needsReview = submission !== null && submission.questions.length === 0;

  return (
    <ScrollView
      className="screen-root"
      contentContainerClassName="screen-scroll-content pt-4"
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled">
      <Card title="Upload student work" description="Add a photo of marked or unmarked work">
        <SelectField
          label="Class"
          value={classId}
          options={classes.map((c) => ({ value: c.id, label: c.name }))}
          onChange={setClassId}
          disabled={scanning}
        />
        <SelectField
          label="Student"
          value={studentId}
          options={students.map((s) => ({ value: s.id, label: s.full_name }))}
          onChange={setStudentId}
          disabled={scanning}
        />
        <SelectField
          label="Unit"
          value={unitId}
          options={units.map((u) => ({ value: u.id, label: u.name }))}
          onChange={setUnitId}
          disabled={scanning}
        />
        <SelectField
          label="Assignment type"
          value={assignmentType}
          options={ASSIGNMENT_TYPES}
          onChange={setAssignmentType}
          disabled={scanning}
        />

        {photoUri ? (
          <View className="relative self-start">
            <Image source={{ uri: photoUri }} className="h-40 w-32 rounded-md" resizeMode="cover" />
            {!scanning && (
              <Pressable
                className="absolute right-1.5 top-1.5 rounded-pill bg-[rgba(31,58,95,0.65)] p-1"
                onPress={resetForm}>
                <X size={14} color={colors.card} />
              </Pressable>
            )}
          </View>
        ) : (
          <View className="items-center gap-2 rounded-md border-[1.5px] border-dashed border-green bg-green-soft py-6">
            <ImageUp size={24} color={colors.green} />
            <Text className="text-center text-body-ink-soft">Tap a button below to add a photo</Text>
          </View>
        )}

        <View className="flex-row gap-2">
          <Pressable
            className="flex-1 flex-row items-center justify-center gap-2 rounded-sm border border-line py-3"
            disabled={scanning}
            onPress={handleTakePhoto}>
            <Camera size={16} color={colors.ink} />
            <Text className="text-body text-ink">{photoUri ? 'Retake' : 'Take Photo'}</Text>
          </Pressable>
          <Pressable
            className="flex-1 flex-row items-center justify-center gap-2 rounded-sm border border-line py-3"
            disabled={scanning}
            onPress={handleChooseFromLibrary}>
            <Images size={16} color={colors.ink} />
            <Text className="text-body text-ink">Library</Text>
          </Pressable>
        </View>

        {photoUri && !submission && (
          <Pressable
            disabled={!canScan}
            onPress={handleScan}
            className={`flex-row items-center justify-center gap-2 rounded-sm bg-green py-3.5 ${
              !canScan ? 'opacity-40' : ''
            }`}>
            {scanning ? (
              <ActivityIndicator color={colors.card} />
            ) : (
              <Sparkles size={16} color={colors.card} />
            )}
            <Text className="font-body-semibold text-body text-card">
              {scanning ? 'Scanning with AI…' : 'Scan with AI'}
            </Text>
          </Pressable>
        )}
        {scanning && (
          <Text className="text-center text-small text-muted">
            OCR + topic analysis run locally on this machine — this can take a few minutes,
            especially without a GPU. Don't close the app.
          </Text>
        )}
        {scanError && (
          <Text className="text-center text-small text-orange">{scanError}</Text>
        )}

        {needsReview && (
          <View className="gap-1.5 rounded-md border border-line bg-orange-soft p-4">
            <Text className="font-body-medium text-body text-orange">Needs manual review</Text>
            <Text className="text-small text-body-ink-soft">
              The AI scanner couldn't find a confident signal for any topic on this submission —
              it's saved and flagged for you to mark by hand.
            </Text>
          </View>
        )}

        {aiScore !== null && !needsReview && (
          <ScoreReview
            aiScore={aiScore}
            score={score}
            onScoreChange={setScore}
            feedback={feedback}
            onFeedbackChange={setFeedback}
          />
        )}

        {submission && (
          <View className="flex-row gap-2">
            <Pressable
              onPress={resetForm}
              className="flex-1 flex-row items-center justify-center gap-2 rounded-sm border border-line py-3.5">
              <X size={16} color={colors.ink} />
              <Text className="font-body-semibold text-body text-ink">Cancel</Text>
            </Pressable>
            <Pressable
              disabled={!needsReview && feedback.trim().length === 0}
              onPress={resetForm}
              className={`flex-1 flex-row items-center justify-center gap-2 rounded-sm bg-green py-3.5 ${
                !needsReview && feedback.trim().length === 0 ? 'opacity-40' : ''
              }`}>
              <CheckCircle2 size={16} color={colors.card} />
              <Text className="font-body-semibold text-body text-card">Done</Text>
            </Pressable>
          </View>
        )}
        {submission && !needsReview && feedback.trim().length === 0 && (
          <Text className="text-center text-small text-muted">
            Add feedback for the student before finishing.
          </Text>
        )}
      </Card>
    </ScrollView>
  );
}

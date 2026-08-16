import { Pencil } from 'lucide-react-native';
import { Text, TextInput, View } from 'react-native';

import { colors } from '@/constants/design-tokens';

type ScoreReviewProps = {
  aiScore: number;
  score: number;
  onScoreChange: (score: number) => void;
  feedback: string;
  onFeedbackChange: (feedback: string) => void;
};

export function ScoreReview({
  aiScore,
  score,
  onScoreChange,
  feedback,
  onFeedbackChange,
}: ScoreReviewProps) {
  const isOverridden = score !== aiScore;

  function handleOverrideChange(text: string) {
    const digits = text.replace(/[^0-9]/g, '');
    if (digits === '') {
      onScoreChange(0);
      return;
    }
    onScoreChange(Math.min(100, parseInt(digits, 10)));
  }

  return (
    <View className="gap-4 rounded-md border border-line bg-card p-4">
      <View className="flex-row items-center justify-between">
        <Text className="font-body-medium text-eyebrow uppercase text-muted">AI-graded score</Text>
        <View className={`rounded-pill px-2.5 py-1 ${isOverridden ? 'bg-orange-soft' : 'bg-green-soft'}`}>
          <Text
            className={`font-body-medium text-small ${isOverridden ? 'text-orange' : 'text-green-dark'}`}>
            {isOverridden ? `Overridden from ${aiScore}%` : 'AI suggested'}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center justify-between">
        <Text className="font-display-semibold text-page-title text-ink">{score}%</Text>

        <View className="flex-row items-center gap-1.5 rounded-sm border border-line px-2.5 py-1.5">
          <Pencil size={13} color={colors.muted} />
          <TextInput
            keyboardType="number-pad"
            value={String(score)}
            onChangeText={handleOverrideChange}
            selectTextOnFocus
            className="w-8 p-0 text-right text-body text-ink"
          />
          <Text className="text-body text-muted">%</Text>
        </View>
      </View>

      <View className="gap-1.5">
        <Text className="font-body-medium text-eyebrow uppercase text-muted">Feedback for student</Text>
        <TextInput
          multiline
          value={feedback}
          onChangeText={onFeedbackChange}
          placeholder="Write feedback for the student..."
          placeholderTextColor={colors.muted}
          textAlignVertical="top"
          className="min-h-24 rounded-sm border border-line p-3 text-body text-ink"
        />
      </View>
    </View>
  );
}

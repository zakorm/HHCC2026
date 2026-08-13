import { Text, View } from 'react-native';

type MasteryRowProps = {
  topic: string;
  weakOrStrong: 'strong' | 'weak';
  percent: number;
};

export function MasteryRow({ topic, weakOrStrong, percent }: MasteryRowProps) {
  const isStrong = weakOrStrong === 'strong';

  return (
    <View className="gap-1">
      <View className="flex-row items-center justify-between">
        <Text className="text-body-ink">{topic}</Text>
        <View className={`rounded-pill px-2 py-[3px] ${isStrong ? 'bg-sage-soft' : 'bg-coral-soft'}`}>
          <Text className={`font-body-medium text-small ${isStrong ? 'text-sage' : 'text-coral'}`}>
            {isStrong ? 'Strong' : 'Needs work'}
          </Text>
        </View>
      </View>
      <View className="h-1.5 overflow-hidden rounded-pill bg-line">
        <View
          className={`h-full rounded-pill ${isStrong ? 'bg-sage' : 'bg-coral'}`}
          style={{ width: `${percent}%` }}
        />
      </View>
    </View>
  );
}

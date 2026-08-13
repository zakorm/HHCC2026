import { Text, View } from 'react-native';

type StatusVariant = 'done' | 'processing';

type StatusPillProps = {
  label: string;
  variant: StatusVariant;
};

const VARIANT_CLASSES: Record<StatusVariant, { bg: string; fg: string }> = {
  done: { bg: 'bg-sage-soft', fg: 'text-sage' },
  processing: { bg: 'bg-accent-soft', fg: 'text-accent' },
};

export function StatusPill({ label, variant }: StatusPillProps) {
  const { bg, fg } = VARIANT_CLASSES[variant];

  return (
    <View className={`rounded-pill px-2 py-1 ${bg}`}>
      <Text className={`font-body-medium text-small ${fg}`}>{label}</Text>
    </View>
  );
}

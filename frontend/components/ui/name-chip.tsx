import { Text, View } from 'react-native';

type NameChipProps = {
  name: string;
};

export function NameChip({ name }: NameChipProps) {
  return (
    <View className="rounded-pill border border-line bg-bg px-3.5 py-1">
      <Text className="font-body-medium text-small text-ink-soft">{name}</Text>
    </View>
  );
}

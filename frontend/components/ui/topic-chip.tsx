import { Text, View } from 'react-native';

import { colors } from '@/constants/design-tokens';

type TopicChipStatus = 'strong' | 'weak' | 'neutral';

type TopicChipProps = {
  name: string;
  percent: number;
  status: TopicChipStatus;
};

const STATUS_STYLES: Record<TopicChipStatus, { fg: string; bar: string }> = {
  strong: { fg: colors.greenDark, bar: colors.green },
  weak: { fg: colors.orange, bar: colors.orange },
  neutral: { fg: colors.muted, bar: colors.neutralBar },
};

export function TopicChip({ name, percent, status }: TopicChipProps) {
  const { fg, bar } = STATUS_STYLES[status];

  return (
    <View className="w-28 gap-1.5 rounded-md border border-line bg-card p-2.5">
      <Text className="font-body-medium text-small text-ink" numberOfLines={1}>
        {name}
      </Text>
      <Text className="font-display-semibold text-body" style={{ color: fg }}>
        {status === 'neutral' ? '—' : `${percent}%`}
      </Text>
      <View className="h-1 overflow-hidden rounded-pill bg-line">
        <View
          className="h-full rounded-pill"
          style={{ width: `${status === 'neutral' ? 100 : percent}%`, backgroundColor: bar }}
        />
      </View>
    </View>
  );
}

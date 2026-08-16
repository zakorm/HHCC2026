import { TrendingDown, TrendingUp } from 'lucide-react-native';
import { Text, View } from 'react-native';

import { colors } from '@/constants/design-tokens';

type StatusBoxVariant = 'strong' | 'weak';

type StatusBoxProps = {
  variant: StatusBoxVariant;
  topic: string;
  percent: number;
};

const VARIANT_STYLES: Record<
  StatusBoxVariant,
  { bg: string; fg: string; barBg: string; barFg: string; label: string; Icon: typeof TrendingUp }
> = {
  strong: {
    bg: 'bg-green-soft',
    fg: 'text-green-dark',
    barBg: 'bg-white',
    barFg: colors.green,
    label: 'Strong area',
    Icon: TrendingUp,
  },
  weak: {
    bg: 'bg-orange-soft',
    fg: 'text-ink',
    barBg: 'bg-white',
    barFg: colors.orange,
    label: 'Needs support',
    Icon: TrendingDown,
  },
};

export function StatusBox({ variant, topic, percent }: StatusBoxProps) {
  const { bg, fg, barBg, barFg, label, Icon } = VARIANT_STYLES[variant];

  return (
    <View className={`flex-1 gap-2.5 rounded-md p-3.5 ${bg}`}>
      <Icon size={18} color={variant === 'strong' ? colors.greenDark : colors.orange} />
      <Text className={`font-body-semibold text-small ${fg}`}>{label}</Text>
      <Text className="font-display-medium text-card-title text-ink" numberOfLines={1}>
        {topic}
      </Text>
      <Text className={`font-display text-page-title ${fg}`}>{percent}%</Text>
      <View className={`h-1.5 overflow-hidden rounded-pill ${barBg}`}>
        <View className="h-full rounded-pill" style={{ width: `${percent}%`, backgroundColor: barFg }} />
      </View>
    </View>
  );
}

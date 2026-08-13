import { Text, View } from 'react-native';

type AvatarSize = 'sm' | 'md' | 'lg';

type AvatarProps = {
  initials: string;
  variant?: AvatarSize;
};

const CIRCLE_CLASSES: Record<AvatarSize, string> = {
  sm: 'w-[30px] h-[30px]',
  md: 'w-10 h-10',
  lg: 'w-[58px] h-[58px]',
};

const TEXT_CLASSES: Record<AvatarSize, string> = {
  sm: 'text-[11px]',
  md: 'text-sm',
  lg: 'text-[20px]',
};

export function Avatar({ initials, variant = 'md' }: AvatarProps) {
  return (
    <View className={`items-center justify-center rounded-full bg-accent-soft ${CIRCLE_CLASSES[variant]}`}>
      <Text className={`font-body-semibold text-ink ${TEXT_CLASSES[variant]}`}>{initials}</Text>
    </View>
  );
}

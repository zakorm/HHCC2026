import { Text, View, type ViewProps } from 'react-native';

type CardProps = ViewProps & {
  title?: string;
  description?: string;
};

export function Card({ title, description, children, className, ...rest }: CardProps) {
  return (
    <View
      className={`surface-card gap-3.5 ${className ?? ''}`}
      {...rest}>
      {title ? <Text className="font-display text-card-title text-ink">{title}</Text> : null}
      {description ? <Text className="font-body text-body text-muted">{description}</Text> : null}
      {children}
    </View>
  );
}

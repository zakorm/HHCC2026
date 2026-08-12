import { StyleSheet, Text, View, type ViewProps } from 'react-native';

import { colors, fonts, radii, spacing, typeScale } from '@/constants/design-tokens';

type CardProps = ViewProps & {
  title?: string;
  description?: string;
};

export function Card({ title, description, children, style, ...rest }: CardProps) {
  return (
    <View style={[styles.card, style]} {...rest}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {description ? <Text style={styles.description}>{description}</Text> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing.lg,
    gap: spacing.md,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: typeScale.cardTitle,
    color: colors.ink,
  },
  description: {
    fontFamily: fonts.body,
    fontSize: typeScale.body,
    color: colors.muted,
  },
});

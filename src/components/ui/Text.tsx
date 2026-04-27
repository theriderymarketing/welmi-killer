import { Text as RNText, type TextProps as RNTextProps, type TextStyle } from 'react-native';
import { type } from '@/theme';

type Variant = keyof typeof type;

type Props = RNTextProps & {
  variant?: Variant;
  color?: string;
  align?: TextStyle['textAlign'];
  uppercase?: boolean;
};

/**
 * Themed text. Reads font + size from `theme.type` map.
 * Use this everywhere. Don't pass random fontSize.
 */
export function T({ variant = 'body', color = '#FAFAF7', align, uppercase, style, ...rest }: Props) {
  const t = type[variant];
  return (
    <RNText
      {...rest}
      style={[
        {
          fontFamily: t.family,
          fontSize: t.size,
          lineHeight: t.lineHeight,
          letterSpacing: t.letter,
          color,
          textAlign: align,
          textTransform: uppercase ? 'uppercase' : undefined
        },
        style
      ]}
    />
  );
}

import { Stack } from 'expo-router';
import { colors } from '@/theme';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.canvas },
        animation: 'slide_from_right',
        animationDuration: 280,
        gestureEnabled: true
      }}
    />
  );
}

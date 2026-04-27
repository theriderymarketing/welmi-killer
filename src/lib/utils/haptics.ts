import * as Haptics from 'expo-haptics';

export const tap = () => Haptics.selectionAsync();
export const success = () =>
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
export const warning = () =>
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
export const error = () =>
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
export const press = () =>
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

import { View, ScrollView, TextInput, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { router } from 'expo-router';
import { T } from '@/components/ui/Text';
import { PressScale } from '@/components/ui/Pressable';
import { useSaveMeal } from '@/hooks/useAnalyzeFood';
import { colors, radius, type } from '@/theme';

/**
 * Manual entry — fast keyboard-first flow.
 * One row = one item. Sums update live. Save when totals match a real meal.
 */
export default function ManualScreen() {
  const save = useSaveMeal();

  const [name, setName] = useState('');
  const [kcal, setKcal] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');

  const valid = name.trim().length > 0 && Number(kcal) > 0;

  const submit = async () => {
    if (!valid) return;
    await save.mutateAsync({
      consumedAt: new Date(),
      source: 'manual',
      items: [
        {
          name: name.trim(),
          quantityG: 100,
          kcal: Number(kcal),
          proteinG: Number(protein) || 0,
          carbsG: Number(carbs) || 0,
          fatG: Number(fat) || 0
        }
      ]
    });
    router.back();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.canvas }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={{ paddingHorizontal: 24, paddingTop: 8, alignItems: 'flex-end' }}>
          <Pressable onPress={() => router.back()} hitSlop={16}>
            <T variant="bodyMd" color={colors.inkMid}>
              Close
            </T>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}>
          <T variant="label" color={colors.inkLow} uppercase style={{ marginTop: 16 }}>
            Manual entry
          </T>
          <T
            style={{
              fontFamily: type.display.family,
              fontSize: 56,
              lineHeight: 60,
              letterSpacing: -2,
              color: colors.inkHi,
              marginTop: 4
            }}
          >
            Type it in.
          </T>

          <View style={{ marginTop: 28, gap: 14 }}>
            <Field label="What did you eat?" value={name} onChange={setName} placeholder="e.g. Greek yogurt with honey" />

            <Field
              label="Calories"
              value={kcal}
              onChange={setKcal}
              placeholder="0"
              keyboardType="number-pad"
              suffix="kcal"
            />

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Field
                label="Protein"
                value={protein}
                onChange={setProtein}
                placeholder="0"
                keyboardType="decimal-pad"
                suffix="g"
                flex
              />
              <Field
                label="Carbs"
                value={carbs}
                onChange={setCarbs}
                placeholder="0"
                keyboardType="decimal-pad"
                suffix="g"
                flex
              />
              <Field
                label="Fat"
                value={fat}
                onChange={setFat}
                placeholder="0"
                keyboardType="decimal-pad"
                suffix="g"
                flex
              />
            </View>
          </View>
        </ScrollView>

        <View style={{ paddingHorizontal: 24, paddingBottom: 16 }}>
          <PressScale
            haptic="press"
            onPress={submit}
            disabled={!valid || save.isPending}
            style={{
              backgroundColor: valid ? colors.accent : colors.surface,
              borderRadius: radius.lg,
              paddingVertical: 18,
              alignItems: 'center',
              opacity: valid ? 1 : 0.5
            }}
          >
            <T variant="h3" color={valid ? colors.accentInk : colors.inkLow}>
              {save.isPending ? 'Saving…' : 'Log meal'}
            </T>
          </PressScale>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  keyboardType = 'default',
  suffix,
  flex
}: {
  label: string;
  value: string;
  onChange: (s: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'number-pad' | 'decimal-pad';
  suffix?: string;
  flex?: boolean;
}) {
  return (
    <View style={flex ? { flex: 1 } : undefined}>
      <T variant="label" color={colors.inkLow} uppercase>
        {label}
      </T>
      <View
        style={{
          marginTop: 8,
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: radius.md,
          paddingHorizontal: 14,
          paddingVertical: 14,
          flexDirection: 'row',
          alignItems: 'baseline',
          gap: 6
        }}
      >
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={colors.inkLow}
          keyboardType={keyboardType}
          style={{
            flex: 1,
            fontFamily: type.bodyMd.family,
            fontSize: 16,
            color: colors.inkHi,
            padding: 0
          }}
        />
        {suffix ? (
          <T variant="bodySm" color={colors.inkLow}>
            {suffix}
          </T>
        ) : null}
      </View>
    </View>
  );
}

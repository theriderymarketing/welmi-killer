import { View, Text, Pressable, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { router } from 'expo-router';
import { useUserId } from '@/hooks/useProfile';
import { upsertProfileFromOnboarding } from '@/db/repos/profile';
import { bmrMifflin, ageFromBirthdate, type Gender } from '@/lib/nutrition/bmr';
import { tdee, targetKcal, type Activity, type Goal } from '@/lib/nutrition/tdee';
import * as haptics from '@/lib/utils/haptics';

/**
 * Single-screen onboarding (V1). Sufficient to compute TDEE.
 * Future: split into 7 swipeable screens.
 */
export default function OnboardingScreen() {
  const { data: userId } = useUserId();

  const [gender, setGender] = useState<Gender>('male');
  const [birthdate, setBirthdate] = useState('1990-01-01');
  const [heightCm, setHeightCm] = useState('178');
  const [weightKg, setWeightKg] = useState('75');
  const [activity, setActivity] = useState<Activity>('moderate');
  const [goal, setGoal] = useState<Goal>('maintain');
  const [pace, setPace] = useState('0.5');
  const [submitting, setSubmitting] = useState(false);

  const ageYears = ageFromBirthdate(birthdate);
  const weight = Number(weightKg);
  const height = Number(heightCm);
  const paceNum = Number(pace);
  const valid = weight > 30 && height > 100 && ageYears > 10 && ageYears < 100;

  const previewBmr = valid ? bmrMifflin({ gender, weightKg: weight, heightCm: height, ageYears }) : 0;
  const previewTdee = valid ? tdee(previewBmr, activity) : 0;
  const previewTarget = valid ? targetKcal({ tdee: previewTdee, goal, paceKgPerWeek: paceNum }) : 0;

  const submit = async () => {
    if (!valid || !userId || submitting) return;
    setSubmitting(true);
    haptics.success();
    await upsertProfileFromOnboarding({
      userId,
      gender,
      birthdate,
      heightCm: height,
      weightKg: weight,
      activityLevel: activity,
      goal,
      paceKgPerWeek: paceNum
    });
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView className="flex-1 bg-ink-950">
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView className="px-5">
          <Text className="text-white text-3xl font-bold mt-4">Set up your profile</Text>
          <Text className="text-ink-500 mt-1">We compute your daily calorie target on-device.</Text>

          <Section label="Gender">
            <Chips
              options={['male', 'female', 'other'] as Gender[]}
              value={gender}
              onChange={setGender}
            />
          </Section>

          <Section label="Birthdate (YYYY-MM-DD)">
            <Input value={birthdate} onChangeText={setBirthdate} placeholder="1990-01-01" />
          </Section>

          <Section label="Height (cm)">
            <Input value={heightCm} onChangeText={setHeightCm} keyboardType="number-pad" />
          </Section>

          <Section label="Weight (kg)">
            <Input value={weightKg} onChangeText={setWeightKg} keyboardType="decimal-pad" />
          </Section>

          <Section label="Activity">
            <Chips
              options={['sedentary', 'light', 'moderate', 'active', 'very_active'] as Activity[]}
              value={activity}
              onChange={setActivity}
            />
          </Section>

          <Section label="Goal">
            <Chips options={['lose', 'maintain', 'gain'] as Goal[]} value={goal} onChange={setGoal} />
          </Section>

          {goal !== 'maintain' && (
            <Section label="Pace (kg/week)">
              <Input value={pace} onChangeText={setPace} keyboardType="decimal-pad" />
            </Section>
          )}

          <View className="bg-ink-800 rounded-2xl p-4 mt-6 mb-4">
            <Text className="text-ink-500 text-xs uppercase tracking-widest">Preview</Text>
            <View className="flex-row justify-between mt-3">
              <Stat k="BMR" v={`${previewBmr}`} />
              <Stat k="TDEE" v={`${previewTdee}`} />
              <Stat k="Target" v={`${previewTarget}`} />
            </View>
          </View>

          <Pressable
            onPress={submit}
            disabled={!valid || submitting}
            className={`rounded-2xl py-4 mb-10 items-center ${valid ? 'bg-accent-lime' : 'bg-ink-700'}`}
          >
            <Text className="text-ink-950 font-bold text-base">
              {submitting ? 'Saving…' : 'Start tracking'}
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View className="mt-5">
      <Text className="text-ink-300 text-sm font-medium mb-2">{label}</Text>
      {children}
    </View>
  );
}

function Chips<T extends string>({
  options,
  value,
  onChange
}: {
  options: T[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <View className="flex-row flex-wrap gap-2">
      {options.map((o) => (
        <Pressable
          key={o}
          onPress={() => {
            haptics.tap();
            onChange(o);
          }}
          className={`px-4 py-2 rounded-full border ${
            value === o ? 'bg-accent-lime border-accent-lime' : 'bg-ink-800 border-ink-700'
          }`}
        >
          <Text className={`text-sm font-medium ${value === o ? 'text-ink-950' : 'text-ink-300'}`}>
            {o.replace('_', ' ')}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

function Input(props: React.ComponentProps<typeof TextInput>) {
  return (
    <TextInput
      {...props}
      placeholderTextColor="#52525b"
      className="bg-ink-800 border border-ink-700 rounded-xl px-4 py-3 text-white"
    />
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <View>
      <Text className="text-ink-500 text-xs">{k}</Text>
      <Text className="text-white text-xl font-bold tabular-nums mt-0.5">{v}</Text>
    </View>
  );
}

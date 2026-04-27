import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { T } from '@/components/ui/Text';
import { PressScale } from '@/components/ui/Pressable';
import { useProfile } from '@/hooks/useProfile';
import { colors, radius, type } from '@/theme';

export default function ProfileScreen() {
  const { data: profile } = useProfile();

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.canvas }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 60 }}>
        <T variant="label" color={colors.inkLow} uppercase style={{ marginTop: 16 }}>
          Profile
        </T>
        <T
          style={{
            fontFamily: 'InstrumentSerif',
            fontSize: 56,
            lineHeight: 60,
            letterSpacing: -2,
            color: colors.inkHi,
            marginTop: 4
          }}
        >
          You.
        </T>

        {/* Hero stats */}
        {profile ? (
          <View style={{ marginTop: 32, gap: 10 }}>
            <Row k="Daily target" v={`${profile.targetKcal} kcal`} />
            <Row k="TDEE" v={`${profile.tdeeKcal} kcal`} />
            <Row k="BMR" v={`${profile.bmrKcal} kcal`} />
            <Row k="Weight" v={`${profile.weightKg} kg`} />
            <Row k="Height" v={`${profile.heightCm} cm`} />
            <Row k="Goal" v={profile.goal} capitalize />
            <Row k="Pace" v={profile.goal === 'maintain' ? '—' : `${profile.paceKgPerWeek} kg / week`} />
            <Row k="Adjust mode" v={profile.adjustMode} capitalize />
          </View>
        ) : null}

        {/* Connections */}
        <PressScale
          haptic="tap"
          onPress={() => router.push('/connections')}
          style={{
            marginTop: 32,
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderWidth: 1,
            borderRadius: radius.lg,
            padding: 18,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <View>
            <T variant="h3" color={colors.inkHi}>
              Connections
            </T>
            <T variant="bodySm" color={colors.inkMid} style={{ marginTop: 2 }}>
              Strava, COROS, Oura
            </T>
          </View>
          <T variant="h3" color={colors.inkLow}>
            ›
          </T>
        </PressScale>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ k, v, capitalize = false }: { k: string; v: string; capitalize?: boolean }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.divider
      }}
    >
      <T variant="bodyMd" color={colors.inkMid}>
        {k}
      </T>
      <T
        style={{
          fontFamily: type.num.family,
          fontSize: 16,
          color: colors.inkHi,
          textTransform: capitalize ? 'capitalize' : 'none'
        }}
      >
        {v}
      </T>
    </View>
  );
}

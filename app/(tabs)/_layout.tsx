import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { T } from '@/components/ui/Text';
import { colors } from '@/theme';

const ICONS: Record<string, string> = {
  index: '◐',
  train: '◈',
  stats: '◧',
  profile: '◔'
};

function TabBarIcon({ name, focused }: { name: keyof typeof ICONS; focused: boolean }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', width: 32, height: 32 }}>
      <T
        style={{
          fontSize: 18,
          color: focused ? colors.accent : colors.inkLow
        }}
      >
        {ICONS[name]}
      </T>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.canvas,
          borderTopColor: colors.divider,
          borderTopWidth: 1,
          height: 76,
          paddingTop: 6
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.inkLow,
        tabBarLabelStyle: {
          fontFamily: 'Inter-600',
          fontSize: 10,
          letterSpacing: 0.8,
          textTransform: 'uppercase'
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Today',
          tabBarIcon: ({ focused }) => <TabBarIcon name="index" focused={focused} />
        }}
      />
      <Tabs.Screen
        name="train"
        options={{
          title: 'Train',
          tabBarIcon: ({ focused }) => <TabBarIcon name="train" focused={focused} />
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'History',
          tabBarIcon: ({ focused }) => <TabBarIcon name="stats" focused={focused} />
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'You',
          tabBarIcon: ({ focused }) => <TabBarIcon name="profile" focused={focused} />
        }}
      />
    </Tabs>
  );
}

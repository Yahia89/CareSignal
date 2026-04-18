import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { FamilyTabParamList, FamilyStackParamList } from '../types';
import { FamilyDashboardScreen } from '../screens/family/FamilyDashboardScreen';
import { AlertsScreen } from '../screens/family/AlertsScreen';
import { FamilySettingsScreen } from '../screens/family/FamilySettingsScreen';
import { ElderDetailScreen } from '../screens/family/ElderDetailScreen';
import { Colors, Typography } from '../constants/theme';
import { useHouseholdStore } from '../store/householdStore';

const Tab = createBottomTabNavigator<FamilyTabParamList>();
const Stack = createNativeStackNavigator<FamilyStackParamList>();

function FamilyTabs(): React.JSX.Element {
  const unreadCount = useHouseholdStore((s) => s.alerts.filter((a) => !a.read).length);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: {
          backgroundColor: Colors.card,
          borderTopColor: Colors.border,
          paddingTop: 4,
        },
        tabBarLabelStyle: {
          fontSize: Typography.fontSizeXs,
          fontWeight: Typography.fontWeightSemiBold,
        },
        tabBarIcon: ({ focused, color, size }) => {
          const icons: Record<string, [string, string]> = {
            FamilyDashboard: ['grid', 'grid-outline'],
            Alerts: ['notifications', 'notifications-outline'],
            FamilySettings: ['settings', 'settings-outline'],
          };
          const [active, inactive] = icons[route.name] ?? ['ellipse', 'ellipse-outline'];
          return (
            <Ionicons
              name={(focused ? active : inactive) as any}
              size={size}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen
        name="FamilyDashboard"
        component={FamilyDashboardScreen}
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen
        name="Alerts"
        component={AlertsScreen}
        options={{
          title: 'Alerts',
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
        }}
      />
      <Tab.Screen
        name="FamilySettings"
        component={FamilySettingsScreen}
        options={{ title: 'Settings' }}
      />
    </Tab.Navigator>
  );
}

export function FamilyNavigator(): React.JSX.Element {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="FamilyTabs" component={FamilyTabs} />
      <Stack.Screen name="ElderDetail" component={ElderDetailScreen} />
    </Stack.Navigator>
  );
}

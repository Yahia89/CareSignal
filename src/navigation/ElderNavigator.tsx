import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { ElderTabParamList } from '../types';
import { ElderHomeScreen } from '../screens/elder/ElderHomeScreen';
import { ElderProfileScreen } from '../screens/elder/ElderProfileScreen';
import { Colors, Typography } from '../constants/theme';

const Tab = createBottomTabNavigator<ElderTabParamList>();

export function ElderNavigator(): React.JSX.Element {
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
            ElderHome: ['home', 'home-outline'],
            ElderProfile: ['person-circle', 'person-circle-outline'],
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
        name="ElderHome"
        component={ElderHomeScreen}
        options={{ title: 'Check In' }}
      />
      <Tab.Screen
        name="ElderProfile"
        component={ElderProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

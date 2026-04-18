import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ElderStackParamList } from '../types';
import { ElderHomeScreen } from '../screens/elder/ElderHomeScreen';
import { ElderConfirmationScreen } from '../screens/elder/ElderConfirmationScreen';

const Stack = createNativeStackNavigator<ElderStackParamList>();

export function ElderNavigator(): React.JSX.Element {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
      <Stack.Screen name="ElderHome" component={ElderHomeScreen} />
      <Stack.Screen name="ElderConfirmation" component={ElderConfirmationScreen} />
    </Stack.Navigator>
  );
}

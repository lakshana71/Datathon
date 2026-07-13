// CrimeSphere AI — AppNavigator
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useAuthStore } from '../store/authStore';
import { Colors } from '../constants/colors';

// Screens
import { LoginScreen } from '../screens/auth/LoginScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';
import { ControlRoomScreen } from '../screens/dashboard/ControlRoomScreen';
import { CaseFilesScreen } from '../screens/cases/CaseFilesScreen';
import { CaseDetailScreen } from '../screens/cases/CaseDetailScreen';
import { EvidenceViewerScreen } from '../screens/cases/EvidenceViewerScreen';
import { SideDrawer } from '../components/layout/SideDrawer';

// Navigation parameter lists
import type { AuthStackParamList, DrawerParamList, CaseStackParamList } from '../types/navigation';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator<DrawerParamList>();
const CaseStack = createStackNavigator<CaseStackParamList>();

// Nested Case Stack to allow Case Files -> Case Detail -> Evidence
const CaseStackNavigator = () => {
  return (
    <CaseStack.Navigator screenOptions={{ headerShown: false }}>
      <CaseStack.Screen name="CaseFiles" component={CaseFilesScreen} />
      <CaseStack.Screen name="CaseDetail" component={CaseDetailScreen} />
      <CaseStack.Screen name="EvidenceViewer" component={EvidenceViewerScreen} />
    </CaseStack.Navigator>
  );
};

// Authenticated flow Drawer
const DrawerNavigator = () => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <SideDrawer {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          width: 230,
        },
      }}
    >
      <Drawer.Screen name="ControlRoom" component={ControlRoomScreen} />
      <Drawer.Screen name="CaseFiles" component={CaseStackNavigator} />
    </Drawer.Navigator>
  );
};

// Auth stack
const AuthNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
};

export const AppNavigator = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="App" component={DrawerNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

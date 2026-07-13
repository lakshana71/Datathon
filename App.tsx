import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import {
  Spectral_500Medium,
  Spectral_600SemiBold,
  Spectral_700Bold,
} from '@expo-google-fonts/spectral';
import {
  IBMPlexSans_400Regular,
  IBMPlexSans_500Medium,
  IBMPlexSans_600SemiBold,
} from '@expo-google-fonts/ibm-plex-sans';
import {
  IBMPlexMono_400Regular,
  IBMPlexMono_500Medium,
} from '@expo-google-fonts/ibm-plex-mono';
import { AppNavigator } from './src/navigation/AppNavigator';
import { LoadingSpinner } from './src/components/ui/LoadingSpinner';

export default function App() {
  const [fontsLoaded] = useFonts({
    Spectral_500Medium,
    Spectral_600SemiBold,
    Spectral_700Bold,
    IBMPlexSans_400Regular,
    IBMPlexSans_500Medium,
    IBMPlexSans_600SemiBold,
    IBMPlexMono_400Regular,
    IBMPlexMono_500Medium,
  });

  if (!fontsLoaded) {
    return <LoadingSpinner fullScreen message="Loading database fonts..." />;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <AppNavigator />
    </SafeAreaProvider>
  );
}

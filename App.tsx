/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { HomeScreen } from './src/app/HomeScreen';
import { registerAll } from './src/experiences/registerAll';

function App() {
  registerAll();

  return (
    <SafeAreaProvider>
      <HomeScreen />
    </SafeAreaProvider>
  );
}

export default App;

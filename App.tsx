import React from 'react';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TransitionPresets } from '@react-navigation/stack';

import SplashScreen from './src/screens/SplashScreen/SplashScreen';
import MainScreen from './src/screens/MainScreen/MainScreen';
import ImagePreview from './src/screens/ImagePreview/ImagePreview';
import ExtractedText from './src/screens/ExtractedText/ExtractedText';

const Stack = createNativeStackNavigator();

const App = () => {
  
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="SplashScreen"
        screenOptions={{
            ...TransitionPresets.SlideFromRightIOS,
            headerShown: false,
        }}
      >
        <Stack.Screen component={SplashScreen} name="SplashScreen" />
        <Stack.Screen component={MainScreen} name="MainScreen" />
        <Stack.Screen component={ImagePreview} name="ImagePreview" />
        <Stack.Screen component={ExtractedText} name="ExtractedText" />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
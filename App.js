import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useFonts } from 'expo-font';
import React, { useEffect, useCallback, useState } from 'react';
import { View, Text } from 'react-native';
import { ThemeProvider } from 'styled-components';

import { useDefaultStyleSheet } from './components/style';
import Sqlite from './db/Sqlite';
import QuizzesScreen from './scenes/Quizes';
import NavBarQuizzes from './scenes/Quizes/NavBar';
import HomeScreen from './scenes/Home';
import NomeUserScreen from './scenes/NomeUser/GetNomeUser';
// import SplashScreen from './scenes/Splash';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import Lobster from './assets/Lobster-Regular.ttf';
import PermanentMarker from './assets/PermanentMarker-Regular.ttf';

const Stack = createNativeStackNavigator()

function AppSplash() {
  const style = useDefaultStyleSheet()
  return (
    <ThemeProvider theme={style} >
      <NavigationContainer initialRouteName="NomeUser">
        <Stack.Navigator>
          <Stack.Screen name="NomeUser" component={NomeUserScreen} options={{ title: 'NomeUser', headerShown: false }} />
          {/* <Stack.Screen name="Splash" component={SplashScreen} options={{ title: 'Splash', headerShown: false }} /> */}
          <Stack.Screen name="Quizzes" component={QuizzesScreen} options={{ title: 'Quizzes', headerShown: false, header: () => <NavBarQuizzes /> }} />
          <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Home', headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider >
  )
}

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false)

  async function initProject() {
    await Sqlite.runDDL().catch(err => alert(err))
  }

  useEffect(() => {
    async function prepare() {
      try {
        await SplashScreen.preventAutoHideAsync()
        await Font.loadAsync({
          'Lobster-Regular': Lobster,
          'PermanentMarker-Regular': PermanentMarker
        })
        await Font.loadAsync([])
        initProject()
      } catch (e) {
        console.warn(e)
      } finally {
        // Tell the application to render
        setAppIsReady(true)
      }
    }

    prepare()
  }, [])

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync()
    }
  }, [appIsReady])

  if (!appIsReady) {
    return null
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <AppSplash />
    </View>
  )
}
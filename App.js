import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { ThemeProvider } from 'styled-components';

import { useDefaultStyleSheet } from './components/style';
import Sqlite from './db/Sqlite';
import ContatosScreen from './scenes/Contatos';
import NavBarContatos from './scenes/Contatos/NavBar';
import HomeScreen from './scenes/Home';
import NomeUserScreen from './scenes/NomeUser/GetNomeUser';
import SplashScreen from './scenes/Splash';

const Stack = createNativeStackNavigator();

export default function App() {
  const style = useDefaultStyleSheet()

  async function initProject() {
    await Sqlite.runDDL().catch(err => alert(err))
  }

  useEffect(() => {
    initProject()
  }, [])

  return (
    <ThemeProvider theme={style}>
      <NavigationContainer initialRouteName="Login">
        <Stack.Navigator>
          <Stack.Screen name="Splash" component={SplashScreen} options={{ title: 'Splash', headerShown: false }} />
          <Stack.Screen name="NomeUser" component={NomeUserScreen} options={{ title: 'NomeUser', headerShown: false }} />
          <Stack.Screen name="Contatos" component={ContatosScreen} options={{ title: 'Contatos', headerShown: false, header: () => <NavBarContatos /> }} />
          <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Home', headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
}
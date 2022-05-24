import 'react-native-gesture-handler'

import AppLoading from 'expo-app-loading'
import React from 'react'
import { Text, View } from 'react-native'

import ErrorContainer from './components/ErrorContainer'
import MainNavigator from './components/navigation'
import Sqlite from './db/Sqlite'
import { ThemeProvider } from 'styled-components'
import { useDefaultStyleSheet } from './components/style'
import { useFonts } from 'expo-font'

export default function App () {
  const style = useDefaultStyleSheet()
  const [isReady, setIsReady] = React.useState(false)
  const [fontsLoaded] = useFonts({
    'Roboto-Bold': require('./assets/Roboto-Bold.ttf'),
    'Roboto-Italic': require('./assets/Roboto-Italic.ttf'),
    'Roboto-Regular': require('./assets/Roboto-Regular.ttf')
  })

  async function initProject () {
    await Sqlite.runDDL().catch(err => alert(err))
    await Sqlite.addNewColumns()
  }

  if (!isReady || !fontsLoaded) {
    return <AppLoading startAsync={initProject} onFinish={() => setIsReady(true)} onError={console.warn}>
      <View>
        <Text>Carregando app</Text>
      </View>
    </AppLoading>
  }

  return <ErrorContainer>
    <ThemeProvider theme={style}>
      <MainNavigator />
    </ThemeProvider>
  </ErrorContainer>
}

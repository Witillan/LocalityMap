import AsyncStorage from '@react-native-async-storage/async-storage'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { androidId, getIosIdForVendorAsync } from 'expo-application'
import { manufacturer, modelName } from 'expo-device'
import React, { useEffect, useRef, useState, useCallback } from 'react'
import { Alert, AppState, Platform } from 'react-native'
import { updateConfig } from '../../hooks/useConfig'
import { updatePermissions } from '../../hooks/usePermissions'
import { getApiUrl, getRequestOptions, incluirCredenciais, removerCredenciais } from '../../util/fetch'
import { AuthContext } from './contexts'
import { DrawerNavigator, StackNavigationLogin } from './Navigation'
import { SplashScreen } from './SplashScreen'

const Stack = createStackNavigator()

const MainNavigator = () => {
  const [state, dispatch] = React.useReducer(
    (prevState, action) => {
      switch (action.type) {
        case 'RESTORE_DATA':
          return {
            ...prevState,
            token: action.token,
            userInfo: action.userInfo,
            refreshToken: action.refreshToken,
            subEmpresaId: action.subEmpresaId,
            empresa: action.empresa,
            isLoading: false
          }
        case 'SIGN_IN':
          return {
            ...prevState,
            isSignout: false,
            isLoading: false,
            token: action.token,
            userInfo: action.userInfo,
            empresa: action.empresa,
            refreshToken: action.refreshToken,
            subEmpresaId: action.subEmpresaId,
            sincronizar: true
          }
        case 'SET_LOADING':
          return {
            ...prevState,
            isLoading: true
          }
        case 'SET_DEVICE_ALLOWED':
          return {
            ...prevState,
            dispositivoLiberado: action.dispositivoLiberado
          }
        case 'CANCEL_LOADING':
          return {
            ...prevState,
            isLoading: false
          }
        case 'SIGN_OUT':
          return {
            ...prevState,
            isSignout: true,
            token: null
          }
        case 'CHANGE_SUBEMPRESA':
          return {
            ...prevState,
            token: action.token,
            userInfo: action.userInfo,
            refreshToken: action.refreshToken,
            subEmpresaId: action.subEmpresaId
          }
      }
    },
    {
      isLoading: false,
      isSignout: false,
      token: null,
      subEmpresaId: null,
      refreshToken: null,
      userInfo: null,
      empresa: null,
      dispositivoLiberado: false
    }
  )
  const appState = useRef(AppState.currentState)
  const [appStateVisible, setAppStateVisible] = useState(appState.current)

  useEffect(() => {
    AppState.addEventListener('change', _handleAppStateChange)

    return () => {
      AppState.removeEventListener('change', _handleAppStateChange)
    }
  }, [])

  const _handleAppStateChange = (nextAppState) => {
    appState.current = nextAppState
    setAppStateVisible(appState.current)
  }
  // Fetch the token from storage then navigate to our appropriate place
  const bootstrapAsync = useCallback(async () => {
    const token = await AsyncStorage.getItem('Authorization')
    const empresaStr = await AsyncStorage.getItem('Empresa')
    const userInfoStr = await AsyncStorage.getItem('UserInfo')
    const refreshToken = await AsyncStorage.getItem('RefreshToken')
    const subEmpresaId = await AsyncStorage.getItem('SubEmpresaId')
    const dispositivoLiberado = await AsyncStorage.getItem('DispositivoLiberado')

    const payload = { type: 'RESTORE_DATA', token, refreshToken, empresa: JSON.parse(empresaStr), userInfo: JSON.parse(userInfoStr), subEmpresaId, dispositivoLiberado: dispositivoLiberado === 'true' }

    dispatch(payload)
  }, [])

  useEffect(() => {
    dispatch({ type: 'SET_LOADING' })
    bootstrapAsync()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    bootstrapAsync()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appStateVisible])

  const authContext = React.useMemo(() => ({
    signIn: async ({ id, senha, empresa, subEmpresaId }, sincronizar) => {
      if (!state.dispositivoLiberado) {
        Alert.alert('Validar Dispositivo', 'O dispositivo ainda não está liberado para uso, contate o administrador')
        return
      }

      dispatch({ type: 'SET_LOADING' })
      const options = await getRequestOptions('POST', false, { id, senha, empresaId: empresa.id, subEmpresaId })

      const response = await fetch(`${await getApiUrl()}/Auth/Token`, options)

      if (response.ok) {
        const body = await response.json()

        await incluirCredenciais(body.token, body.refreshToken, JSON.stringify(body.userInfo), subEmpresaId, sincronizar, state.dispositivoLiberado)

        updateConfig()
        updatePermissions()
        dispatch({ type: 'SIGN_IN', token: body.token, refreshToken: body.refreshToken, userInfo: body.userInfo, empresa, subEmpresaId })
      } else {
        Alert.alert('Erro', await response.text())
      }

      dispatch({ type: 'CANCEL_LOADING' })
    },
    signOut: () => {
      removerCredenciais().then(() => dispatch({ type: 'SIGN_OUT' }))
    },
    changeSubEmpresaId: async subEmpresaId => {
      const expiredToken = await AsyncStorage.getItem('Authorization')

      const refreshToken = await AsyncStorage.getItem('RefreshToken')

      const userInfoStr = await AsyncStorage.getItem('UserInfo')

      const userInfo = JSON.parse(userInfoStr)

      const options = await getRequestOptions('POST', false, { expiredToken, refreshToken, subEmpresaId })

      const response = await fetch(`${await getApiUrl()}/Auth/Token/RefreshSubEmpresa`, options)

      if (response.ok) {
        const body = await response.json()
        userInfo.subEmpresa = body.subEmpresa

        await incluirCredenciais(body.token, body.refreshToken, JSON.stringify(userInfo), subEmpresaId, true, true)
        dispatch({ type: 'CHANGE_SUBEMPRESA', token: body.token, refreshToken: body.refreshToken, userInfo, subEmpresaId })
      } else {
        throw new Error(await response.text())
      }
    },
    verificarLiberacaoDispositivo: async (empresaId) => {
      // Se for a empresa com CPF '000.000.000-00' não será feita a validação, por conta da App Store e também facilitar os testes
      if (empresaId === '1d61d6ce-b0a6-42a3-b691-3c9fdae43ec2') {
        dispatch({ type: 'SET_DEVICE_ALLOWED', dispositivoLiberado: true })
        await AsyncStorage.setItem('DispositivoLiberado', 'true')
        return true
      }

      const uniqueId = Platform.OS === 'android' ? androidId : (await getIosIdForVendorAsync())

      const verificarUniqueIdPorMacResponse = await fetch(`${await getApiUrl()}/LiberacaoDispositivo/ObterUmPorMac/${empresaId}/${uniqueId}`, await getRequestOptions('GET', false))
      if (verificarUniqueIdPorMacResponse.status === 500) {
        throw new Error('Ocorreu um erro ao verificar a liberação do seu dispositivo')
      } else if (verificarUniqueIdPorMacResponse.status === 204) {
        const obj = {
          empresaId,
          enderecoMac: uniqueId,
          modeloDispositivo: `${manufacturer} - ${modelName}`,
          liberado: false
        }

        const criacaoValidacaoResponse = await fetch(`${await getApiUrl()}/LiberacaoDispositivo/Incluir`, await getRequestOptions('POST', false, obj))

        if (!criacaoValidacaoResponse.ok) {
          throw new Error('Ocorreu um erro ao criar a validação de dispositivo')
        }

        dispatch({ type: 'SET_DEVICE_ALLOWED', dispositivoLiberado: false })
        await AsyncStorage.setItem('DispositivoLiberado', 'false')
        return false
      } else if (verificarUniqueIdPorMacResponse.status === 200) {
        const objValidacao = await verificarUniqueIdPorMacResponse.json()

        dispatch({ type: 'SET_DEVICE_ALLOWED', dispositivoLiberado: objValidacao.liberado })
        await AsyncStorage.setItem('DispositivoLiberado', objValidacao.liberado.toString())

        return objValidacao.liberado
      }
    },
    ...state
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [state.token, state.dispositivoLiberado, state.empresa, state.subEmpresaId, state.userInfo])

  return <AuthContext.Provider value={authContext}>
    <NavigationContainer>
      <Stack.Navigator>
        {state.isLoading ? (
          // We haven't finished checking for the token yet
          <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
        ) : state.token == null ? (
          // No token found, user isn't signed in
          <Stack.Screen name="SignIn" component={StackNavigationLogin} options={{ title: 'Login', animationTypeForReplace: state.isSignout ? 'pop' : 'push', headerShown: false }} />
        ) : (
          // User is signed in
          <Stack.Screen options={{ headerShown: false }} name="Home" component={DrawerNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  </AuthContext.Provider>
}

export default MainNavigator

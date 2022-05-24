import AsyncStorage from '@react-native-async-storage/async-storage'
import { useCallback, useEffect, useState } from 'react'
import { Alert } from 'react-native'
import { getApiUrl, getRequestOptions } from '../util/fetch'

export const useConfig = () => {
  const [value, setValue] = useState({})
  const [mustUpdate, setMustUpdate] = useState(false)

  const execute = useCallback(() => {
    AsyncStorage.getItem('Configuracoes')
      .then((response) => {
        const config = JSON.parse(response)
        setValue(config[0])
      })
      .catch(() => {
        setValue({})
      })
      .finally(() => {
        setMustUpdate(false)
      })
  }, [])

  useEffect(() => {
    execute()
  }, [execute, mustUpdate])

  const refreshConfig = useCallback(() => {
    setMustUpdate(true)
  }, [])

  return [value, refreshConfig]
}

export const updateConfig = async () => {
  const configuracoes = await fetch(`${await getApiUrl()}/Configuracao/ObterVarios`, await getRequestOptions('GET', true))

  if (configuracoes.ok) {
    const bodyConfig = await configuracoes.json()
    await AsyncStorage.setItem('Configuracoes', JSON.stringify(bodyConfig))
  } else {
    Alert.alert('Erro', 'Ocorreu um erro ao obter as configurações. Entre em contato com o suporte Alpha Software.')
  }
}

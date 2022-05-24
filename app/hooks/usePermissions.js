import AsyncStorage from '@react-native-async-storage/async-storage'
import { useCallback, useEffect, useState } from 'react'
import { Alert } from 'react-native'
import { getApiUrl, getRequestOptions } from '../util/fetch'

export const usePermissions = () => {
  const [value, setValue] = useState({})
  const [mustUpdate, setMustUpdate] = useState(false)

  const execute = useCallback(() => {
    AsyncStorage.getItem('Permissoes')
      .then((response) => {
        const permissoes = JSON.parse(response)
        setValue(permissoes || {})
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

  const refreshPermissions = useCallback(() => {
    setMustUpdate(true)
  }, [])

  return [value, refreshPermissions]
}

export const updatePermissions = async () => {
  const permissoesResponse = await fetch(`${await getApiUrl()}/UsuariosPermissoes/GetPermissaoUsuarioLogado`, await getRequestOptions('GET', true))

  if (permissoesResponse.ok) {
    const bodyPermissions = await permissoesResponse.json()
    await AsyncStorage.setItem('Permissoes', JSON.stringify(bodyPermissions))
  } else {
    Alert.alert('Erro', 'Ocorreu um erro ao obter as permissões. Entre em contato com o suporte Alpha Software.')
  }
}

export const UsuarioPermissaoOpcao = { NaoAutorizado: 0, Autorizado: 1 }

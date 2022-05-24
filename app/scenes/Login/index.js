import React, { useContext, useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { getApiUrl, getRequestOptions } from '../../util/fetch'
import SelecaoEmpresa from './SelecaoEmpresa'
import Login from './Login'
import { useFocusEffect } from '@react-navigation/native'
import * as yup from 'yup'
import { setLocale } from 'yup'
import { Alert } from 'react-native'
import LiberacaoPendente from './LiberacaoPendente'
import { AuthContext } from '../../components/navigation/contexts'

setLocale({
  mixed: {
    required: () => 'Este campo é obrigatório!'
  },
  string: {
    min: ({ min }) => `O campo deve conter no mínimo ${min} carateres!`,
    max: ({ max }) => `O campo não pode exceder ${max} caracteres!`
  }
})

const ValidationLogin = yup.object({
  subEmpresaId: yup.string().nullable().required(),
  id: yup.string().nullable().required(),
  senha: yup.string().nullable().min(4).required()
})

export default () => {
  const { signIn, verificarLiberacaoDispositivo, dispositivoLiberado } = useContext(AuthContext)
  // JSON da empresa selecionada
  const [empresaFromStorage, setEmpresaFromStorage] = useState('')
  // Empresa convertida através da string de empresa vindo do form de empresa
  const [empresa, setEmpresa] = useState({})
  // State para controlar enquanto alguma requisição está em andamento
  const [loading, setLoading] = useState(false)
  // Validação do login
  const [validation, setValidation] = useState(null)

  // Verifica se há uma empresa registrada e se há um token ativo
  const verificarEmpresa = async () => {
    const empresaStr = await AsyncStorage.getItem('Empresa')
    setEmpresaFromStorage(empresaStr)

    if (empresaStr) {
      setEmpresa(JSON.parse(empresaStr))
    }
  }

  const login = obj => {
    ValidationLogin
      .validate(obj, { abortEarly: false })
      .then(async () => {
        signIn(obj, 'true')
      })
      .catch(r => {
        setValidation(r)
      })
  }

  // Chama a API para obter a empresa a partir de CPF/CNPJ
  const obterEmpresa = async (empresaCnpj) => {
    setLoading(true)

    return fetch(`${await getApiUrl()}/Empresas/ObterPorCnpj/${empresaCnpj}`, await getRequestOptions('GET', false))
      .then(async r => {
        if (r.status === 200) {
          const empresaResponse = await r.text()

          await AsyncStorage.setItem('Empresa', empresaResponse)
          setEmpresaFromStorage(empresaResponse)

          const objEmpresa = JSON.parse(empresaResponse)
          setEmpresa(objEmpresa)
        } else if (r.status === 204) {
          Alert.alert('Não encontrado', 'O CPF/CNPJ digitado não corresponde a nenhuma empresa cadastrada!')
        } else {
          Alert.alert('Não encontrado', 'Não foi possível obter a empresa com o CPF/CNPJ informado!')
        }
      })
      .catch(err => Alert.alert('Erro', err.message))
      .finally(() => setLoading(false))
  }

  const trocarEmpresa = async () => {
    await AsyncStorage.removeItem('Empresa')
    setEmpresaFromStorage('')
  }

  useFocusEffect(React.useCallback(() => { verificarEmpresa() }, []))
  useEffect(() => {
    if (!empresa.id) {
      return
    }

    verificarLiberacaoDispositivo(empresa.id)
  }, [empresa, verificarLiberacaoDispositivo])

  if (!empresaFromStorage) {
    return <SelecaoEmpresa loading={loading} onSubmit={obterEmpresa} />
  }

  if (!dispositivoLiberado) {
    return <LiberacaoPendente empresaId={empresa.id} trocarEmpresa={trocarEmpresa} />
  }

  return <Login validation={validation} trocarEmpresa={trocarEmpresa} loading={loading} setLoading={setLoading} empresa={empresa} onSubmit={login} />
}

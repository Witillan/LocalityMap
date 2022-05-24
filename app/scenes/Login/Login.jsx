import { Picker } from '@react-native-picker/picker'
import { useFocusEffect } from '@react-navigation/native'
import React, { useContext, useState } from 'react'
import {
  Alert,
  Dimensions,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableWithoutFeedback,
  View
} from 'react-native'

import TouchableOpacityButtonPrimary from '../../components/Buttons/TouchableOpacityButtonPrimary'
import TouchableOpacityButtonSuccess from '../../components/Buttons/TouchableOpacityButtonSuccess'
import { ModalBasic } from '../../components/Modal/ModalLoading'
import { AuthContext } from '../../components/navigation/contexts'
import {
  ContainerPickerView,
  Input,
  Label,
  LabelValidation,
  ScrollView1,
  useDefaultStyleSheet
} from '../../components/style'
import { getApiUrl, getRequestOptions } from '../../util/fetch'

export default ({ onSubmit, validation, loading, setLoading, empresa, trocarEmpresa }) => {
  const screen = Dimensions.get('window')
  const [usuarios, setUsuarios] = useState([])
  const [subEmpresas, setSubEmpresas] = useState([])
  const [id, setId] = useState('')
  const [subEmpresaId, setSubEmpresaId] = useState('')
  const [senha, setSenha] = useState('')
  const { defaultStyle, pickerItemColor, placeholderTextColor } = useDefaultStyleSheet()
  const { isLoading } = useContext(AuthContext)

  const renderSubEmpresa = () => {
    if (!subEmpresas) {
      return
    }

    const qtdSubEmpresas = subEmpresas.length

    if (qtdSubEmpresas > 1) {
      return <>
        <Label style={styles.marginVertical10} >Empresa</Label>
        <ContainerPickerView>
          <Picker
            placeholderTextColor={placeholderTextColor}
            itemStyle={defaultStyle.itemStyle}
            style={defaultStyle.text}
            selectedValue={subEmpresaId}
            onValueChange={(value, _) => setSubEmpresaId(value)}>
            <Picker.Item color={pickerItemColor} key={'sub-empresa-selecione'} value={0} label="Selecione" />
            {(subEmpresas || []).map((item, key) => <Picker.Item color={pickerItemColor} key={`sub-empresa-${key}`} value={item.id} label={item.nome} />)}
          </Picker>
        </ContainerPickerView>
        <LabelValidation>
          {extrairErros('subEmpresaId')}
        </LabelValidation>
      </>
    }
  }

  useFocusEffect(React.useCallback(() => {
    if (!empresa || !empresa.id) return
    setLoading(true)

    getRequestOptions('GET', false)
      .then(async options => fetch(`${await getApiUrl()}/Auth/ListarUsuariosEmpresa/${empresa.id}`, options)
        .then(r => {
          if (!r.ok) {
            throw new Error(`Ocorreu um erro ${r.status} ao obter os usuários. Entre em contato com o suporte Alpha Software.`)
          }
          return r
        })
        .then(r => r.json())
        .then(r => setUsuarios(r))
        .catch(err => Alert.alert('Erro', err.message))
      ).finally(() => {
        setLoading(false)
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [empresa]))

  React.useEffect(() => {
    if (!id) { return }

    setLoading(true)

    getRequestOptions('GET', false)
      .then(async options => fetch(`${await getApiUrl()}/Auth/ObterSubEmpresas/${id}`, options)
        .then(r => {
          if (!r.ok) {
            throw new Error(`Ocorreu um erro ${r.status} ao obter as empresas. Entre em contato com o suporte Alpha Software.`)
          }
          return r
        })
        .then(r => r.json())
        .then(r => {
          setSubEmpresas(r)
          if (r.length === 1) {
            setSubEmpresaId(r[0].id)
          }
        })
        .catch(err => Alert.alert('Erro', err.message))
      ).finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const extrairErros = (campo) => {
    if (!validation || !validation?.errors?.length) {
      return null
    }

    const erro = validation?.inner.find(q => q.path === campo)

    if (erro === undefined) {
      return null
    }

    return erro.message
  }

  return (
    <KeyboardAvoidingView
      style={[styles.inner, defaultStyle.background1]}
      behavior={Platform.OS === 'ios' ? 'position' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? screen.height * 0.0001 : screen.height * 0.0002}
    >
      <TouchableWithoutFeedback style={defaultStyle.background1} onPress={Keyboard.dismiss}>
        <View>
          <ScrollView1>
            <View style={styles.divImage}>
              <Image style={styles.image} source={require('../../assets/logo.png')} />
            </View>
            <Label style={styles.marginVertical10}>Usuário</Label>
            <ContainerPickerView>
              <Picker
                placeholderTextColor={placeholderTextColor}
                style={defaultStyle.inputPicker}
                itemStyle={defaultStyle.itemStyle}
                selectedValue={id}
                onValueChange={(value, _) => setId(value)}>
                <Picker.Item color={pickerItemColor} key={'usuario-selecione'} value="" label="Selecione" />
                {(usuarios || []).map((item, key) => <Picker.Item color={pickerItemColor} key={`usuario-${key}`} value={item.id} label={item.nome} />)}
              </Picker>
            </ContainerPickerView>
            <LabelValidation>
              {extrairErros('id')}
            </LabelValidation>
            {renderSubEmpresa()}
            <Label style={styles.marginVertical10}>Senha</Label>
            <Input secureTextEntry={true} placeholderTextColor={placeholderTextColor} placeholder='Digite sua senha aqui' value={senha} keyboardType='numeric' onChangeText={setSenha}></Input>
            <LabelValidation>
              {extrairErros('senha')}
            </LabelValidation>
            <View>
              <TouchableOpacityButtonSuccess
                disabled={loading || isLoading}
                onSubmit={() => onSubmit({ id, senha, empresa, subEmpresaId })}
                label="ENTRAR"
                style={[styles.marginVertical10, styles.marginBottom30]}
              />
              <TouchableOpacityButtonPrimary
                disabled={loading || isLoading}
                onSubmit={trocarEmpresa}
                label="TROCAR EMPRESA"
                style={defaultStyle.buttonPrimary}
              />
            </View>
            <ModalBasic loading={loading} message="Carregando..." />
          </ScrollView1>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  validation: {
    fontSize: 10,
    color: 'red'
  },
  marginVertical10: {
    marginVertical: 10
  },
  marginBottom30: {
    marginBottom: 30
  },
  inner: {
    paddingTop: 0,
    paddingBottom: 24,
    paddingLeft: 24,
    paddingRight: 24,
    flex: 1,
    justifyContent: 'center'
  },
  image: {
    width: 180,
    height: 180,
    marginTop: 50
  },
  divImage: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  input: {
    width: 280,
    marginBottom: 5,
    borderBottomWidth: 1.5,
    borderBottomColor: '#000000',
    color: '#000000'
  },
  button: {
    marginBottom: 50
  }
})

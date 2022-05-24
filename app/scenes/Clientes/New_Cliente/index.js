import { Picker } from '@react-native-picker/picker'
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native'
import moment from 'moment'
import React, { useCallback, useRef, useState } from 'react'
import {
  Alert,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  TouchableWithoutFeedback,
  View
} from 'react-native'
import { TextInputMask } from 'react-native-masked-text'
import { ClienteService } from '../../../api/cliente'
import TouchableOpacityButtonSuccess from '../../../components/Buttons/TouchableOpacityButtonSuccess'
import { ModalBasic } from '../../../components/Modal/ModalLoading'
import { AuthContext } from '../../../components/navigation/contexts'
import {
  Container1,
  ContainerPickerView,
  Input,
  InputDisabled,
  Label,
  LabelRequired,
  LabelValidation,
  ScrollView1,
  useDefaultStyleSheet
} from '../../../components/style'
import ValidationNewClienteSchema from '../../../components/Validation/NewClienteValidation'
import CidadeDao from '../../../db/CidadeDao'
import ClienteDAO, { TipoPessoa } from '../../../db/ClienteDao'
import LogDAO from '../../../db/LogDao'
import { useConfig } from '../../../hooks/useConfig'
import { checkConnection } from '../../../hooks/useNetworkStatus'
import { getApiUrl, getRequestOptions } from '../../../util/fetch'
import { createUUID } from '../../../util/guid'

const NewClienteScreen = () => {
  const screen = Dimensions.get('window')
  const navigation = useNavigation()
  const route = useRoute()
  const { defaultStyle, pickerItemColor, placeholderTextColor } = useDefaultStyleSheet()
  const { empresa } = React.useContext(AuthContext)
  const [nomeRazao, setNomeRazao] = useState('')
  const refNomeRazao = useRef(null)
  const [apelido, setApelido] = useState('')
  const refApelido = useRef(null)
  const [tipoPessoa, setTipoPessoa] = useState('')
  const [cpf, setCpf] = useState('')
  const refCpf = useRef(null)
  const [rg, setRg] = useState('')
  const refRg = useRef(null)
  const [codigoIbgeCidade, setCodigoIbgeCidade] = useState('')
  const [endereco, setEndereco] = useState('')
  const refEndereco = useRef(null)
  const [uf, setUf] = useState('')
  const [numero, setNumero] = useState('')
  const refNumero = useRef(null)
  const [bairro, setBairro] = useState('')
  const refBairro = useRef(null)
  const [complemento, setComplemento] = useState('')
  const refComplemento = useRef(null)
  const [telefone, setTelefone] = useState('')
  const refTelefone = useRef(null)
  const [celular, setCelular] = useState('')
  const refCelular = useRef(null)
  const [contato, setContato] = useState('')
  const refContato = useRef(null)
  const [observacao, setObservacao] = useState('')
  const refObservacao = useRef(null)
  const [cnpj, setCnpj] = useState('')
  const refCnpj = useRef(null)
  const [cep, setCep] = useState('')
  const refCep = useRef(null)
  const [listCidade, setListCidade] = useState([])
  const [validation, setValidation] = useState(null)
  const [idAlphaExpress, setIdAlphaExpress] = useState(0)
  const [vendedores, setVendedores] = useState('')
  const [config, refreshConfig] = useConfig()

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('Salvando...')
  const listUf = CidadeDao.ListUFs()
  const { tempId } = route?.params || {}
  const readOnly = !!tempId

  const changeCep = useCallback(async (e) => {
    setCep(e)

    if (e.length === 9) {
      if (!await checkConnection()) {
        Alert.alert('Offline', 'Não será possível obter o endereço pelo cep, pois você está offline')
        return
      }
      fetch(`https://viacep.com.br/ws/${e.replace('-', '')}/json/`)
        .then(r => r.json())
        .then(r => {
          setUf(r.uf)
          setBairro(r.bairro)
          setEndereco(r.logradouro)
          setComplemento(r.complemento)
          setCodigoIbgeCidade(parseInt(r.ibge))
        })
        .catch(() => Alert.alert('Erro', 'Ocorreu um erro ao obter o endereço por cep'))
    }
  }, [setCep, setUf, setBairro, setEndereco, setComplemento, setCodigoIbgeCidade])

  const changeCnpj = useCallback(async (e) => {
    setCnpj(e)

    // Valida tamanho do Cnpj formatado
    if (e.length === 18) {
      if (!await checkConnection()) {
        Alert.alert('Offline', 'Não será possível encontrar seus dados, pois você está offline')
        return
      }
      const cnpj = e.replace('.', '').replace('.', '').replace('/', '').replace('-', '')
      fetch(`https://www.receitaws.com.br/v1/cnpj/${cnpj}`)
        .then(r => {
          if (r.status === 429) {
            throw new Error('Limite de requisições atingido! Tente novamente em alguns minutos')
          } else if (r.status === 504) {
            throw new Error('Tempo limite de busca por CNPJ! Tente novamente em alguns minutos')
          }

          return r
        })
        .then(r => r.json())
        .then(r => {
          if (r.status === 'ERROR') {
            throw new Error('CNPJ inválido!')
          }
          if (r.cep !== undefined) {
            changeCep(r.cep.replace('-', '').replace('.', ''))
          }
          setNumero(r.numero)
          setNomeRazao(r.nome)
          setTelefone(r.telefone)
          setApelido(r.fantasia)
          setComplemento(r.complemento)
        })
        .catch(e => Alert.alert('Erro', e.message))
    }
  }, [setCnpj, changeCep, setNumero, setNomeRazao, setTelefone, setApelido, setComplemento])

  const confirmarCpfOrCnpj = useCallback(async (cpfOrCnpj) => {
    if (await checkConnection()) {
      return getRequestOptions('GET', true)
        .then(async (options) => fetch(`${await getApiUrl()}/Clientes/VerificarCpfOuCnpj?cpfOuCnpj=${cpfOrCnpj}`, options))
        .then((r) => {
          if (!r.ok) {
            throw new Error(`Ocorreu um erro ${r.status} ao verificar o CPF/CNPJ. Entre em contato com o suporte Alpha Software.`)
          }
          return r
        })
        .then(r => r.json())
        .then(r => {
          return r.existe
        })
    }
  }, [])

  const extrairErros = useCallback((campo) => {
    if (!validation || !validation?.errors?.length) {
      return null
    }

    const erro = validation?.inner.find(q => q.path === campo)

    if (!erro) {
      return null
    }

    return erro.message
  }, [validation])

  useFocusEffect(useCallback(() => {
    refreshConfig()
    const init = async () => {
      if (!readOnly) return

      const cliente = await ClienteDAO.GetClienteWithTempId(tempId)
      const cidade = await CidadeDao.GetByCodigoIbge(cliente.codigoIbgeCidade)

      setTipoPessoa(cliente.tipoPessoa)
      setIdAlphaExpress(cliente.idAlphaExpress)
      setNomeRazao(cliente.nomeRazao)
      setApelido(cliente.apelido)
      setRg(cliente.rg)
      setCep(cliente.cep)
      setTelefone(cliente.telefone)
      setCelular(cliente.celular)
      setContato(cliente.contato)
      setUf(cidade.uf)
      setCodigoIbgeCidade(cliente.codigoIbgeCidade)
      setObservacao(cliente.observacao)
      setEndereco(cliente.endereco)
      setNumero(cliente.numero)
      setBairro(cliente.bairro)
      setComplemento(cliente.complemento)
      setVendedores(cliente.vendedores)

      if (cliente.tipoPessoa === TipoPessoa.PessoaFisica) {
        setCpf(cliente.cpf)
      } else if (cliente.tipoPessoa === TipoPessoa.PessoaJuridica) {
        setCnpj(cliente.cpf)
      }
    }

    init()
  }, [readOnly, refreshConfig, tempId]))

  React.useEffect(() => {
    if (!tipoPessoa) return

    setCpf('')
    setCnpj('')
  }, [tipoPessoa])

  React.useEffect(() => {
    if (!uf) return
    CidadeDao.GetByUf(uf)
      .then(r => setListCidade(r))
      .catch(err => Alert.alert('Erro', err))
  }, [uf])

  const submit = useCallback(async () => {
    const obj = {
      tipoPessoa,
      nomeRazao,
      apelido,
      rg,
      telefone,
      celular,
      contato,
      observacao,
      cep,
      codigoIbgeCidade,
      uf,
      endereco,
      numero,
      bairro,
      complemento,
      inativo: 'Não',
      bloqueado: 'Não',
      idAparelho: createUUID(),
      sincronizado: 0,
      empresaId: empresa.id,
      idAlphaExpress,
      vendedores
    }

    if (tipoPessoa === TipoPessoa.PessoaFisica) {
      obj.cpf = refCpf.current.getRawValue()
      if (!tempId) {
        try {
          setLoading(true)
          const cpfOuCnpjInvalido = await confirmarCpfOrCnpj(obj.cpf)
          if (cpfOuCnpjInvalido) {
            alert('CPF/CNPJ já existente na base de dados!')
            return
          }
        } catch (error) {
          alert(error.message)
          return
        } finally {
          setLoading(false)
        }
      }
    } else if (tipoPessoa === TipoPessoa.PessoaJuridica) {
      obj.cnpj = refCnpj.current.getRawValue()
      if (!tempId) {
        try {
          setLoading(true)
          const cpfOuCnpjInvalido = await confirmarCpfOrCnpj(obj.cnpj)
          if (cpfOuCnpjInvalido) {
            alert('CPF/CNPJ já existente na base de dados!')
            return
          }
        } catch (error) {
          alert(error.message)
          return
        } finally {
          setLoading(false)
        }
      }
    }

    obj.tempId = tempId || createUUID()
    obj.id = obj.tempId

    if (tempId) {
      obj.dataAlteracao = moment.utc(new Date()).format()
    }

    ValidationNewClienteSchema
      .validate(obj, { abortEarly: false })
      .then(async () => {
        try {
          setLoading(true)
          setMessage('Salvando...')
          // aplicando CPF ou CNPJ no campo CPF, pois são o mesmo
          obj.cpf = obj.cpf || obj.cnpj

          await ClienteDAO.Insert(obj)

          if (await checkConnection()) {
            setMessage('Sincronizando Cliente...')
            await ClienteService.Sincronizar()
          }

          Alert.alert('Sucesso', 'Cliente salvo com sucesso!')
          navigation.navigate('Clientes')
        } catch (error) {
          LogDAO.GravarLog(error.message)
          Alert.alert('Erro', error.message)
        } finally {
          setLoading(false)
        }
      })
      .catch(r => {
        setValidation(r)
        Alert.alert('Validação', 'Há erro(s) de validação, verifique os campos novamente')
      })
  }, [tipoPessoa, nomeRazao, apelido, rg, telefone, celular, contato, observacao, cep, codigoIbgeCidade, uf, endereco, numero, bairro, complemento, empresa.id, idAlphaExpress, vendedores, tempId, confirmarCpfOrCnpj, navigation])

  const desabilitado = tempId ? !config.alterarClientes : !config.cadastrarClientes

  return (
        <KeyboardAvoidingView
            contentContainerStyle={defaultStyle.background1}
            behavior={Platform.select({ ios: 'padding' })}
            keyboardVerticalOffset={Platform.OS === 'ios' ? screen.height * 0.10 : screen.height}
        >
            <SafeAreaView>
                <ScrollView1>
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <Container1 style={styles.container}>
                            <View>
                                <View style={styles.rowText}><Label>Tipo </Label><LabelRequired>*</LabelRequired></View>
                                <View style={[!readOnly ? defaultStyle.viewPicker : defaultStyle.inputPicker]}>
                                    <Picker
                                        enabled={!readOnly}
                                        label="Tipo"
                                        style={readOnly ? defaultStyle.inputPicker : defaultStyle.text}
                                        selectedValue={tipoPessoa}
                                        onValueChange={(itemValue) => setTipoPessoa(itemValue)}
                                    >
                                        <Picker.Item color={pickerItemColor} label="Selecione uma opção" value="" />
                                        <Picker.Item color={pickerItemColor} label="Pessoa Física" value={TipoPessoa.PessoaFisica} />
                                        <Picker.Item color={pickerItemColor} label="Pessoa Jurídica" value={TipoPessoa.PessoaJuridica} />
                                    </Picker>
                                </View>
                                <LabelValidation>
                                    {extrairErros('tipoPessoa')}
                                </LabelValidation>
                            </View>
                            {tipoPessoa === TipoPessoa.PessoaFisica && <View>
                                <View style={styles.rowText}><Label>CPF </Label><LabelRequired style={styles.required}>*</LabelRequired></View>
                                <TextInputMask returnKeyType='next' onSubmitEditing={() => refNomeRazao.current.focus()} editable={!readOnly} ref={refCpf} type="cpf" onChangeText={text => setCpf(text)} value={cpf} style={!readOnly ? defaultStyle.input : defaultStyle.inputPicker} keyboardType="number-pad" placeholderTextColor={placeholderTextColor} placeholder="Ex: 000.000.000-00" />
                                <LabelValidation>
                                    {extrairErros('')}
                                </LabelValidation>
                            </View>}
                            {tipoPessoa === TipoPessoa.PessoaJuridica && <View>
                                <View style={styles.rowText}><Label>CNPJ </Label><LabelRequired>*</LabelRequired></View>
                                <TextInputMask returnKeyType='next' onSubmitEditing={() => refNomeRazao.current.focus()} editable={!readOnly} ref={refCnpj} type="cnpj" onChangeText={changeCnpj} value={cnpj} style={!readOnly ? defaultStyle.input : defaultStyle.inputPicker} keyboardType="number-pad" placeholderTextColor={placeholderTextColor} placeholder="Ex: 00.000.000/0001-00" />
                                <LabelValidation>
                                    {extrairErros('')}
                                </LabelValidation>
                            </View>}
                            <View>
                                <View style={styles.rowText}><Label>Nome/Razão social </Label><LabelRequired>*</LabelRequired></View>
                                {!readOnly
                                  ? <Input returnKeyType='next' onSubmitEditing={() => refApelido.current.focus()} editable={!readOnly} multiline={true} blurOnSubmit={true} ref={refNomeRazao} maxLength={60} onChangeText={setNomeRazao} value={nomeRazao} placeholderTextColor={placeholderTextColor} placeholder="Ex: João da Silva LTDA"></Input>
                                  : <InputDisabled editable={!readOnly} multiline={true} blurOnSubmit={true} maxLength={60} onChangeText={setNomeRazao} value={nomeRazao} placeholderTextColor={placeholderTextColor} placeholder="Ex: João da Silva LTDA"></InputDisabled>
                                }
                                <LabelValidation>
                                    {extrairErros('nomeRazao')}
                                </LabelValidation>
                            </View>
                            <View>
                                <Label>Nome Fantasia </Label>
                                {!readOnly
                                  ? <Input returnKeyType='next' onSubmitEditing={() => refRg.current.focus()} editable={!readOnly} multiline={true} blurOnSubmit={true} ref={refApelido} maxLength={60} onChangeText={setApelido} value={apelido} placeholderTextColor={placeholderTextColor} placeholder="Ex: João da Silva"></Input>
                                  : <InputDisabled editable={!readOnly} multiline={true} blurOnSubmit={true} maxLength={60} onChangeText={setApelido} value={apelido} placeholderTextColor={placeholderTextColor} placeholder="Ex: João da Silva"></InputDisabled>
                                }
                                <LabelValidation>
                                    {extrairErros('apelido')}
                                </LabelValidation>
                            </View>
                            <View>
                                <Label>Inscrição Estatual </Label>
                                {!readOnly
                                  ? <Input returnKeyType='next' onSubmitEditing={() => refTelefone.current.focus()} editable={!readOnly} maxLength={14} ref={refRg} onChangeText={setRg} value={rg} placeholderTextColor={placeholderTextColor} placeholder="Ex: 000000000"></Input>
                                  : <InputDisabled editable={!readOnly} maxLength={14} onChangeText={setRg} value={rg} placeholderTextColor={placeholderTextColor} placeholder="Ex: 000000000"></InputDisabled>
                                }
                            </View>
                            <LabelValidation>
                                {extrairErros('rg')}
                            </LabelValidation>
                            <View>
                                <View style={styles.rowText}><Label>Telefone </Label><LabelRequired>*</LabelRequired></View>
                                <Input returnKeyType='next' onSubmitEditing={() => refCelular.current.focus()} maxLength={35} onChangeText={setTelefone} value={telefone} ref={refTelefone} keyboardType="number-pad" placeholderTextColor={placeholderTextColor} placeholder="Ex: (00) 0 0000-0000" />
                                <LabelValidation>
                                    {extrairErros('telefone')}
                                </LabelValidation>
                            </View>
                            <View>
                                <Label>Celular</Label>
                                <Input returnKeyType='next' onSubmitEditing={() => refContato.current.focus()} maxLength={35} onChangeText={setCelular} value={celular} ref={refCelular} keyboardType="number-pad" placeholderTextColor={placeholderTextColor} placeholder="Ex: (00) 0 0000-0000" />
                                <LabelValidation>
                                    {extrairErros('celular')}
                                </LabelValidation>
                            </View>
                            <View>
                                <Label>Contato</Label>
                                <Input returnKeyType='next' onSubmitEditing={() => refCep.current.getElement().focus()} maxLength={15} onChangeText={setContato} ref={refContato} value={contato} placeholderTextColor={placeholderTextColor} placeholder="Ex: João" />
                                <LabelValidation>
                                    {extrairErros('contato')}
                                </LabelValidation>
                            </View>
                            <View>
                                <Label>Cep</Label>
                                <TextInputMask returnKeyType='next' ref={refCep} type="custom" options={{ mask: '99999-999', getRawValue: (value, _) => value.replace('-', '') }} maxLength={9} onChangeText={changeCep} value={cep} style={defaultStyle.input} keyboardType="number-pad" placeholderTextColor={placeholderTextColor} placeholder="Ex: 000000-000" />
                                <LabelValidation>
                                    {extrairErros('cep')}
                                </LabelValidation>
                            </View>
                            <View>
                                <View style={styles.rowText}><Label>UF </Label><LabelRequired>*</LabelRequired></View>
                                <ContainerPickerView>
                                    <Picker
                                        itemStyle={defaultStyle.itemStyle}
                                        style={defaultStyle.text}
                                        label="UF"
                                        selectedValue={uf}
                                        onValueChange={(itemValue) => setUf(itemValue)}
                                    >
                                        <Picker.Item color={pickerItemColor} label="Selecione uma opção" value="" />
                                        {listUf.map(({ sigla, nome }) => <Picker.Item color={pickerItemColor} key={`uf-${sigla}`} label={`${sigla} - ${nome}`} value={sigla} />)}
                                    </Picker>
                                </ContainerPickerView>
                                <LabelValidation>
                                    {extrairErros('uf')}
                                </LabelValidation>
                            </View>
                            <View>
                                <View style={styles.rowText}><Label>Cidade </Label><LabelRequired>*</LabelRequired></View>
                                <ContainerPickerView>
                                    <Picker
                                        label="Cidade"
                                        itemStyle={defaultStyle.itemStyle}
                                        style={defaultStyle.text}
                                        selectedValue={codigoIbgeCidade}
                                        onValueChange={(itemValue) => setCodigoIbgeCidade(itemValue)}>
                                        <Picker.Item color={pickerItemColor} label="Selecione uma opção" value="" />
                                        {listCidade.map(({ codigoIbge, nome }) => <Picker.Item color={pickerItemColor} key={`cidade-${codigoIbge}`} label={nome} value={codigoIbge} />)}
                                    </Picker>
                                </ContainerPickerView>
                                <LabelValidation>
                                    {extrairErros('codigoIbgeCidade')}
                                </LabelValidation>
                            </View>
                            <View>
                                <Label>Observação</Label>
                                <Input returnKeyType='next' onSubmitEditing={() => refEndereco.current.focus()} multiline={true} blurOnSubmit={true} numberOfLines={5} maxLength={350} ref={refObservacao} onChangeText={setObservacao} value={observacao} placeholderTextColor={placeholderTextColor} placeholder="Observações"></Input>
                                <LabelValidation>
                                    {extrairErros('observacao')}
                                </LabelValidation>
                            </View>
                            <View>
                                <View style={styles.rowText}><Label>Endereço </Label><LabelRequired>*</LabelRequired></View>
                                <Input returnKeyType='next' onSubmitEditing={() => refNumero.current.focus()} maxLength={60} onChangeText={setEndereco} value={endereco} ref={refEndereco} placeholderTextColor={placeholderTextColor} placeholder="Endereço"></Input>
                                <LabelValidation>
                                    {extrairErros('endereco')}
                                </LabelValidation>
                            </View>
                            <View>
                                <View style={styles.rowText}><Label>Número </Label><LabelRequired>*</LabelRequired></View>
                                <Input returnKeyType='next' onSubmitEditing={() => refBairro.current.focus()} maxLength={10} onChangeText={setNumero} value={numero} ref={refNumero} placeholderTextColor={placeholderTextColor} placeholder="Número" keyboardType="number-pad"></Input>
                                <LabelValidation>
                                    {extrairErros('numero')}
                                </LabelValidation>
                            </View>
                            <View>
                                <View style={styles.rowText}><Label>Bairro </Label><LabelRequired>*</LabelRequired></View>
                                <Input returnKeyType='next' onSubmitEditing={() => refComplemento.current.focus()} maxLength={25} onChangeText={setBairro} value={bairro} ref={refBairro} placeholderTextColor={placeholderTextColor} placeholder="Bairro"></Input>
                                <LabelValidation>
                                    {extrairErros('bairro')}
                                </LabelValidation>
                            </View>
                            <View>
                                <Label>Complemento</Label>
                                <Input maxLength={60} onChangeText={setComplemento} value={complemento} ref={refComplemento} placeholderTextColor={placeholderTextColor} placeholder="Complemento"></Input>
                                <LabelValidation>
                                    {extrairErros('complemento')}
                                </LabelValidation>
                            </View>
                            <TouchableOpacityButtonSuccess
                                onSubmit={submit}
                                disabled={desabilitado}
                                label='SALVAR'
                            />
                            <ModalBasic loading={loading} message={message} />
                        </Container1>
                    </TouchableWithoutFeedback>
                </ScrollView1>
            </SafeAreaView>
        </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 5
  },
  input: {
    borderBottomWidth: 1.5,
    borderBottomColor: '#C1BFC0'
  },
  buttonSuccess: {
    margin: 5,
    marginBottom: 20
  },
  validation: {
    fontSize: 10,
    color: 'red'
  },
  rowText: {
    flexDirection: 'row'
  },
  required: {
    color: 'red'
  }
})

export default NewClienteScreen

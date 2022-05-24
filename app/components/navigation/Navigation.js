import { AntDesign, Fontisto, MaterialCommunityIcons, SimpleLineIcons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createDrawerNavigator, DrawerItemList } from '@react-navigation/drawer'
import { createStackNavigator } from '@react-navigation/stack'
import { androidId, getIosIdForVendorAsync } from 'expo-application'
import * as Clipboard from 'expo-clipboard'
import Constants from 'expo-constants'
import React, { useEffect, useMemo, useState } from 'react'
import { Alert, Platform, ScrollView, Text, View } from 'react-native'
import { CidadeService } from '../../api/cidade'
import { ClienteService } from '../../api/cliente'
import { CompraService } from '../../api/compra'
import { EstoqueService } from '../../api/estoque'
import { FinanceiroService } from '../../api/financeiro'
import { FormaPagamentoService } from '../../api/formaPagamento'
import { FornecedorService } from '../../api/fornecedor'
import { GrupoProdutoService } from '../../api/grupoProduto'
import { LogService } from '../../api/log'
import { MarcaProdutoService } from '../../api/marcaProduto'
import { PedidoService } from '../../api/pedido'
import { ProdutoService } from '../../api/produto'
import { TabelaPrecoService } from '../../api/tabelaPreco'
import { TabelaPrecoProdutoService } from '../../api/tabelaPrecoProduto'
import { UnidadeProdutoService } from '../../api/unidadeProduto'
import CidadeDAO from '../../db/CidadeDao'
import { updateConfig } from '../../hooks/useConfig'
import { checkConnection } from '../../hooks/useNetworkStatus'
import { updatePermissions } from '../../hooks/usePermissions'
import BackupsScreen from '../../scenes/Backups'
import NavBarBackups from '../../scenes/Backups/NavBar'
import ClienteScreen from '../../scenes/Clientes'
import HistoricoScreen from '../../scenes/Clientes/Historico'
import NavBarHistorico from '../../scenes/Clientes/Historico/NavBar'
import NavBarCliente from '../../scenes/Clientes/NavBar'
import NewClienteScreen from '../../scenes/Clientes/New_Cliente'
import NavBarNewCliente from '../../scenes/Clientes/New_Cliente/NavBar'
import CompraScreen from '../../scenes/Compras'
import NavBarCompras from '../../scenes/Compras/NavBar'
import NewCompraScreen from '../../scenes/Compras/New_Compra'
import NavBarNewCompra from '../../scenes/Compras/New_Compra/NavBar'
import SelectFornecedor from '../../scenes/Compras/New_Compra/Selecionar_Fornecedor'
import NavBarSelectFornecedores from '../../scenes/Compras/New_Compra/Selecionar_Fornecedor/NavBar'
import DashboardScreen from '../../scenes/Dashboard'
import NavBarDashboard from '../../scenes/Dashboard/NavBar'
import EstoqueScreen from '../../scenes/Estoque'
import NavBarEstoque from '../../scenes/Estoque/NavBar'
import FinanceiroScreen from '../../scenes/Financeiro'
import NavBarFinanceiro from '../../scenes/Financeiro/NavBar'
import FornecedorScreen from '../../scenes/Fornecedor'
import HistoricoFornecedorScreen from '../../scenes/Fornecedor/Historico'
import NavBarHistoricoFornecedor from '../../scenes/Fornecedor/Historico/NavBar'
import NavBarFornecedor from '../../scenes/Fornecedor/NavBar'
import NewFornecedorScreen from '../../scenes/Fornecedor/New_Fornecedor'
import NavBarNewFornecedor from '../../scenes/Fornecedor/New_Fornecedor/NavBar'
import LimparDadosScreen from '../../scenes/Limpar_Dados'
import NavBarLimparDados from '../../scenes/Limpar_Dados/NavBar'
import LoginScreen from '../../scenes/Login'
import Logout from '../../scenes/Logout'
import NavBarLogout from '../../scenes/Logout/NavBar'
import PedidoScreen from '../../scenes/Pedidos'
import NavBarPedido from '../../scenes/Pedidos/NavBar'
import NewPedidoScreen from '../../scenes/Pedidos/New_Pedido'
import NavBarNewPedido from '../../scenes/Pedidos/New_Pedido/NavBar'
import SelectCliente from '../../scenes/Pedidos/New_Pedido/Selecionar_Cliente'
import NavBarSelectClientes from '../../scenes/Pedidos/New_Pedido/Selecionar_Cliente/NavBar'
import CarrinhoCompraScreen from '../../scenes/ProdutosCompras/Carrinho/listaCarrinho'
import NavBarCarrinhoCompra from '../../scenes/ProdutosCompras/Carrinho/NavBar'
import ProdutoCompraScreen from '../../scenes/ProdutosCompras/listaProdutos'
import NavBarProdutoCompra from '../../scenes/ProdutosCompras/NavBar'
import NavBarQrCodeReaderCompra from '../../scenes/ProdutosCompras/QrCode/NavBar'
import QrCodeReaderCompraScreen from '../../scenes/ProdutosCompras/QrCode/QrCodeReader'
import CarrinhoScreen from '../../scenes/ProdutosPedidos/Carrinho/listaCarrinho'
import NavBarCarrinho from '../../scenes/ProdutosPedidos/Carrinho/NavBar'
import ProdutoScreen from '../../scenes/ProdutosPedidos/listaProdutos'
import NavBarProduto from '../../scenes/ProdutosPedidos/NavBar'
import NavBarQrCodeReader from '../../scenes/ProdutosPedidos/QrCode/NavBar'
import QrCodeReaderScreen from '../../scenes/ProdutosPedidos/QrCode/QrCodeReader'
import SyncCidadesScreen from '../../scenes/SyncCidades'
import NavBarSyncCidades from '../../scenes/SyncCidades/NavBar'
import TrocarEmpresa from '../../scenes/Trocar_Empresa'
import NavBarTrocarEmpresa from '../../scenes/Trocar_Empresa/NavBar'
import { useDefaultStyleSheet } from '../style'
import {
  AuthContext,
  BackupsContext,
  ClienteContext,
  CompraContext,
  DashboardContext,
  EstoqueContext,
  FinanceiroContext,
  FornecedorContext,
  PedidoContext,
  SyncContext
} from './contexts'

const Stack = createStackNavigator()
const StackNavigationPedido = () => {
  const [filterOpen, setFilterOpen] = useState(false)
  const toggleFilterOpen = () => setFilterOpen(!filterOpen)

  const [qrCodeReaderOpen, setQrCodeReaderOpen] = useState(false)
  const toggleQrCodeReaderOpen = () => setQrCodeReaderOpen(!qrCodeReaderOpen)

  const [selecionados, setSelecionados] = useState([])
  const [produtoSelecionadoIndex, setProdutoSelecionadoIndex] = useState(null)

  const [validation, setValidation] = useState(null)

  const adicionarItem = obj => {
    const indexIgual = selecionados.findIndex(q => q.produtoId === obj.produtoId && q.descontoPercentual === obj.descontoPercentual && obj.valorUnitario === q.valorUnitario)

    const objPedido = { ...obj }

    const finalizar = () => {
      if (indexIgual > -1) {
        objPedido.quantidade += selecionados[indexIgual].quantidade
        objPedido.subTotal = objPedido.quantidade * obj.valorUnitario
        objPedido.valorTotal = objPedido.subTotal - objPedido.descontoReal

        const novosSelecionados = [...selecionados]
        novosSelecionados.splice(indexIgual, 1, objPedido)

        setSelecionados(novosSelecionados)
      } else {
        setSelecionados([...selecionados, objPedido])
      }
    }

    if (obj.aviso) {
      Alert.alert('Aviso', obj.aviso, [
        {
          style: 'cancel',
          text: 'Cancelar'
        },
        {
          text: 'Selecionar',
          onPress: () => {
            finalizar()
          }
        }
      ])
    } else {
      finalizar()
    }
  }

  return <PedidoContext.Provider value={{ toggleQrCodeReaderOpen, adicionarItem, qrCodeReaderOpen, setQrCodeReaderOpen, filterOpen, toggleFilterOpen, setFilterOpen, selecionados, setSelecionados, produtoSelecionadoIndex, setProdutoSelecionadoIndex, validation, setValidation }}>
    <Stack.Navigator initialRouteName="Pedidos">
      <Stack.Screen name="Pedidos" component={PedidoScreen} options={{
        headerStyle: {
          backgroundColor: '#0A7AC3'
        },
        header: () => <NavBarPedido />,
        headerTintColor: 'white'
      }} />
      <Stack.Screen name="NewPedido" component={NewPedidoScreen} options={{
        headerStyle: {
          backgroundColor: '#0A7AC3'
        },
        header: () => <NavBarNewPedido />,
        headerTintColor: 'white'
      }} />
      <Stack.Screen name="SelectCliente" component={SelectCliente} options={{
        headerStyle: {
          backgroundColor: '#0A7AC3'
        },
        header: () => <NavBarSelectClientes />,
        headerTintColor: 'white'
      }} />
      <Stack.Screen name="Produtos" component={ProdutoScreen} options={{
        headerStyle: {
          backgroundColor: '#0A7AC3'
        },
        header: () => <NavBarProduto />,
        headerTintColor: 'white'
      }} />
      <Stack.Screen unmountOnBlur name="QrCodeReader" component={QrCodeReaderScreen} options={{
        headerStyle: {
          backgroundColor: '#0A7AC3'
        },
        header: () => <NavBarQrCodeReader />,
        headerTintColor: 'white'
      }} />
      <Stack.Screen name="Carrinho" component={CarrinhoScreen} options={{
        headerStyle: {
          backgroundColor: '#0A7AC3'
        },
        header: () => <NavBarCarrinho />,
        headerTintColor: 'white'
      }} />
    </Stack.Navigator>
  </PedidoContext.Provider>
}

const StackNavigationDashboard = () => {
  const [filterOpen, setFilterOpen] = useState(false)
  const toggleFilterOpen = () => setFilterOpen(!filterOpen)

  return <DashboardContext.Provider value={{ filterOpen, toggleFilterOpen, setFilterOpen }}>
    <Stack.Navigator>
      <Stack.Screen name="Dashboard" component={DashboardScreen} options={{
        headerStyle: {
          backgroundColor: '#0A7AC3'
        },
        header: () => <NavBarDashboard />,
        headerTintColor: 'white'
      }}
      />
    </Stack.Navigator>
  </DashboardContext.Provider>
}

const StackNavigationCompra = () => {
  const [filterOpen, setFilterOpen] = useState(false)
  const toggleFilterOpen = () => setFilterOpen(!filterOpen)

  const [qrCodeReaderOpen, setQrCodeReaderOpen] = useState(false)
  const toggleQrCodeReaderOpen = () => setQrCodeReaderOpen(!qrCodeReaderOpen)

  const [selecionados, setSelecionados] = useState([])
  const [produtoSelecionadoIndex, setProdutoSelecionadoIndex] = useState(null)

  const [validation, setValidation] = useState(null)

  const adicionarItem = obj => {
    const indexIgual = selecionados.findIndex(q => q.produtoId === obj.produtoId && obj.valorUnitario === q.valorUnitario && obj.descontoReal === q.descontoReal && obj.acrescimo === q.acrescimo)

    const finalizar = () => {
      const objCompra = { ...obj }
      if (indexIgual > -1) {
        objCompra.quantidade += selecionados[indexIgual].quantidade
        objCompra.subTotal = objCompra.quantidade * selecionados[indexIgual].valorUnitario
        objCompra.valorTotal = objCompra.subTotal - objCompra.descontoReal

        const novosSelecionados = [...selecionados]
        novosSelecionados.splice(indexIgual, 1, objCompra)

        setSelecionados(novosSelecionados)
      } else {
        setSelecionados([...selecionados, objCompra])
      }
    }

    if (obj.aviso) {
      Alert.alert('Aviso', obj.aviso, [
        {
          style: 'cancel',
          text: 'Cancelar'
        },
        {
          text: 'Selecionar',
          onPress: () => {
            finalizar()
          }
        }
      ])
    } else {
      finalizar()
    }
  }

  return <CompraContext.Provider value={{ toggleQrCodeReaderOpen, adicionarItem, qrCodeReaderOpen, setQrCodeReaderOpen, filterOpen, toggleFilterOpen, setFilterOpen, selecionados, setSelecionados, produtoSelecionadoIndex, setProdutoSelecionadoIndex, validation, setValidation }}>
    <Stack.Navigator initialRouteName="Compras">
      <Stack.Screen name="Compras" component={CompraScreen} options={{
        headerStyle: {
          backgroundColor: '#0A7AC3'
        },
        header: () => <NavBarCompras />,
        headerTintColor: 'white'
      }} />
      <Stack.Screen name="NewCompra" component={NewCompraScreen} options={{
        headerStyle: {
          backgroundColor: '#0A7AC3'
        },
        header: () => <NavBarNewCompra />,
        headerTintColor: 'white'
      }} />
      <Stack.Screen name="SelectFornecedor" component={SelectFornecedor} options={{
        headerStyle: {
          backgroundColor: '#0A7AC3'
        },
        header: () => <NavBarSelectFornecedores />,
        headerTintColor: 'white'
      }} />
      <Stack.Screen name="ProdutosCompra" component={ProdutoCompraScreen} options={{
        headerStyle: {
          backgroundColor: '#0A7AC3'
        },
        header: () => <NavBarProdutoCompra />,
        headerTintColor: 'white'
      }} />
      <Stack.Screen name="QrCodeReaderCompra" component={QrCodeReaderCompraScreen} options={{
        headerStyle: {
          backgroundColor: '#0A7AC3'
        },
        header: () => <NavBarQrCodeReaderCompra />,
        headerTintColor: 'white'
      }} />
      <Stack.Screen name="CarrinhoCompra" component={CarrinhoCompraScreen} options={{
        headerStyle: {
          backgroundColor: '#0A7AC3'
        },
        header: () => <NavBarCarrinhoCompra />,
        headerTintColor: 'white'
      }} />
    </Stack.Navigator>
  </CompraContext.Provider>
}

// const StackNavigationProduto = () => (
//     <Stack.Navigator>
//         <Stack.Screen name="Produtos" component={ProdutoScreen} options={{
//             headerStyle: {
//                 backgroundColor: '#0A7AC3',
//             },
//             header: () => <NavBarProduto />,
//             headerTintColor: 'white',
//         }} />
//     </Stack.Navigator>
// );

const StackNavigationFinanceiro = () => {
  const [filterOpen, setFilterOpen] = useState(false)
  const toggleFilterOpen = () => setFilterOpen(!filterOpen)

  return <FinanceiroContext.Provider value={{ filterOpen, toggleFilterOpen, setFilterOpen }}>
    <Stack.Navigator>
      <Stack.Screen name="Financeiro" component={FinanceiroScreen} options={{
        headerStyle: {
          backgroundColor: '#0A7AC3'
        },
        header: () => <NavBarFinanceiro />,
        headerTintColor: 'white'
      }} />
    </Stack.Navigator>
  </FinanceiroContext.Provider>
}

const StackNavigationCliente = () => {
  const [filterOpen, setFilterOpen] = useState(false)
  const toggleFilterOpen = () => setFilterOpen(!filterOpen)

  return <ClienteContext.Provider value={{ filterOpen, toggleFilterOpen, setFilterOpen }}>
    <Stack.Navigator>
      <Stack.Screen name="Clientes" component={ClienteScreen} options={{
        headerStyle: {
          backgroundColor: '#0A7AC3'
        },
        header: () => <NavBarCliente />,
        headerTintColor: 'white'
      }} />
      <Stack.Screen name="NewCliente" component={NewClienteScreen} options={{
        headerTitle: 'Novo cliente',
        headerStyle: {
          backgroundColor: '#0A7AC3'
        },
        header: () => <NavBarNewCliente />,
        headerTintColor: 'white'
      }}
      />
      <Drawer.Screen name="Historico" component={HistoricoScreen} options={{
        headerTitle: 'Histórico',
        headerStyle: {
          backgroundColor: '#0A7AC3'
        },
        header: () => <NavBarHistorico />,
        headerTintColor: 'white'
      }}
      />

    </Stack.Navigator>
  </ClienteContext.Provider>
}

const StackNavigationFornecedor = () => {
  const [filterOpen, setFilterOpen] = useState(false)
  const toggleFilterOpen = () => setFilterOpen(!filterOpen)

  return <FornecedorContext.Provider value={{ filterOpen, toggleFilterOpen, setFilterOpen }}>
    <Stack.Navigator>
      <Stack.Screen name="Fornecedores" component={FornecedorScreen} options={{
        headerStyle: {
          backgroundColor: '#0A7AC3'
        },
        header: () => <NavBarFornecedor />,
        headerTintColor: 'white'
      }} />
      <Stack.Screen name="NewFornecedor" component={NewFornecedorScreen} options={{
        headerTitle: 'Novo Fornecedor',
        headerStyle: {
          backgroundColor: '#0A7AC3'
        },
        header: () => <NavBarNewFornecedor />,
        headerTintColor: 'white'
      }}
      />
      <Drawer.Screen name="HistoricoFornecedor" component={HistoricoFornecedorScreen} options={{
        headerTitle: 'Histórico',
        headerStyle: {
          backgroundColor: '#0A7AC3'
        },
        header: () => <NavBarHistoricoFornecedor />,
        headerTintColor: 'white'
      }}
      />

    </Stack.Navigator>
  </FornecedorContext.Provider>
}

const StackNavigationBackups = () => {
  const [loading, setLoading] = useState(false)
  const [atualizar, setAtualizar] = useState(false)
  const toggleAtualizar = () => setAtualizar(!atualizar)

  return <BackupsContext.Provider value={{ loading, setLoading, atualizar, toggleAtualizar, setAtualizar }}>
    <Stack.Navigator>
      <Stack.Screen name="Backups" component={BackupsScreen} options={{
        headerStyle: {
          backgroundColor: '#0A7AC3'
        },
        header: () => <NavBarBackups />,
        headerTintColor: 'white'
      }}
      />
    </Stack.Navigator>
  </BackupsContext.Provider>
}

const StackNavigationEstoque = () => {
  const [filterOpen, setFilterOpen] = useState(false)
  const toggleFilterOpen = () => setFilterOpen(!filterOpen)

  return <EstoqueContext.Provider value={{ filterOpen, toggleFilterOpen, setFilterOpen }}>
    <Stack.Navigator>
      <Stack.Screen name="Estoque" component={EstoqueScreen} options={{
        headerStyle: {
          backgroundColor: '#0A7AC3'
        },
        header: () => <NavBarEstoque />,
        headerTintColor: 'white'
      }}
      />
    </Stack.Navigator>
  </EstoqueContext.Provider>
}

const StackNavigationLimparDados = () => (
  <Stack.Navigator>
    <Stack.Screen name="LimparDados" component={LimparDadosScreen} options={{
      headerStyle: {
        backgroundColor: '#0A7AC3'
      },
      header: () => <NavBarLimparDados />,
      headerTintColor: 'white'
    }}
    />
  </Stack.Navigator>
)

const StackNavigationCidades = () => (
  <Stack.Navigator>
    <Stack.Screen name="SyncCidades" component={SyncCidadesScreen} options={{
      headerStyle: {
        backgroundColor: '#0A7AC3'
      },
      header: () => <NavBarSyncCidades />,
      headerTintColor: 'white'
    }}
    />
  </Stack.Navigator>
)

export const StackNavigationLogin = () => (
  <Stack.Navigator>
    <Stack.Screen name="Login" component={LoginScreen} options={{ title: '', headerShown: false }} />
  </Stack.Navigator>
)

const StackNavigationLogout = () => (
  <Stack.Navigator>
    <Stack.Screen name="Logout" component={Logout} options={{
      headerStyle: {
        backgroundColor: '#0A7AC3'
      },
      header: () => <NavBarLogout />,
      headerTintColor: 'white'
    }} />
  </Stack.Navigator>
)

const StackNavigationTrocarEmpresa = () => (
  <Stack.Navigator>
    <Stack.Screen name="TrocarEmpresa" component={TrocarEmpresa} options={{
      headerStyle: {
        backgroundColor: '#0A7AC3'
      },
      header: () => <NavBarTrocarEmpresa />,
      headerTintColor: 'white'
    }}>
    </Stack.Screen>

  </Stack.Navigator>
)

const Drawer = createDrawerNavigator()

export const DrawerNavigator = () => {
  const authContext = React.useContext(AuthContext)
  const { textPrimaryColor, backgroundColor, defaultStyle } = useDefaultStyleSheet()
  const [uniqueId, setUniqueId] = useState('')

  useEffect(() => {
    if (Platform.OS === 'android') {
      setUniqueId(androidId)
    } else {
      getIosIdForVendorAsync().then(id => setUniqueId(id))
    }
  }, [])

  const trabalhaComVendas = useMemo(() => authContext?.userInfo ? (authContext?.userInfo?.role === 'Consultor geral' || authContext?.userInfo?.role === 'Consultor de vendas') : true, [authContext?.userInfo])
  const trabalhaComCompras = useMemo(() => authContext?.userInfo ? (authContext?.userInfo?.role === 'Consultor geral' || authContext?.userInfo?.role === 'Consultor de compras') : true, [authContext?.userInfo])

  const [state, dispatch] = React.useReducer(
    (prevState, action) => {
      switch (action.type) {
        case 'SYNC':
          return {
            ...prevState,
            loading: true
          }
        case 'CHANGE_MESSAGE':
          return {
            ...prevState,
            message: action.message
          }
        case 'SYNC_FINISH':
          return {
            ...prevState,
            loading: false
          }
      }
    },
    {
      loading: false,
      message: ''
    }
  )

  const syncContext = React.useMemo(() => ({
    sync: async (stop) => {
      if (await checkConnection()) {
        dispatch({ type: 'SYNC' })
        dispatch({ type: 'CHANGE_MESSAGE', message: 'Iniciando sincronização!' })
        try {
          const cidadeCount = await CidadeDAO.Count()

          if (!cidadeCount) {
            dispatch({ type: 'CHANGE_MESSAGE', message: 'Sincronizando cidades' })
            await CidadeService.Obter()
          }

          dispatch({ type: 'CHANGE_MESSAGE', message: 'Sincronizando formas de pagamento' })
          await FormaPagamentoService.Sincronizar()

          dispatch({ type: 'CHANGE_MESSAGE', message: 'Sincronizando unidades de produto' })
          await UnidadeProdutoService.Sincronizar()

          dispatch({ type: 'CHANGE_MESSAGE', message: 'Sincronizando marcas de produto' })
          await MarcaProdutoService.Sincronizar()

          dispatch({ type: 'CHANGE_MESSAGE', message: 'Sincronizando grupos de produto' })
          await GrupoProdutoService.Sincronizar()

          dispatch({ type: 'CHANGE_MESSAGE', message: 'Sincronizando produtos' })
          await ProdutoService.Sincronizar()

          if (trabalhaComVendas) {
            dispatch({ type: 'CHANGE_MESSAGE', message: 'Sincronizando clientes' })
            await ClienteService.Sincronizar()
          }

          if (trabalhaComCompras) {
            dispatch({ type: 'CHANGE_MESSAGE', message: 'Sincronizando fornecedores' })
            await FornecedorService.Sincronizar()
          }

          dispatch({ type: 'CHANGE_MESSAGE', message: 'Sincronizando estoque' })
          await EstoqueService.Sincronizar()

          dispatch({ type: 'CHANGE_MESSAGE', message: 'Sincronizando tabelas de preço' })
          await TabelaPrecoService.Sincronizar()
          await TabelaPrecoProdutoService.Sincronizar()

          if (trabalhaComVendas) {
            dispatch({ type: 'CHANGE_MESSAGE', message: 'Sincronizando pedidos' })
            await PedidoService.Sincronizar()
          }

          if (trabalhaComCompras) {
            dispatch({ type: 'CHANGE_MESSAGE', message: 'Sincronizando compras' })
            await CompraService.Sincronizar()
          }

          dispatch({ type: 'CHANGE_MESSAGE', message: 'Sincronizando financeiro' })
          await FinanceiroService.Sincronizar()

          dispatch({ type: 'CHANGE_MESSAGE', message: 'Sincronizando logs' })
          await LogService.Sincronizar()

          dispatch({ type: 'CHANGE_MESSAGE', message: 'Verificando liberação do dispositivo' })
          const empresaStr = await AsyncStorage.getItem('Empresa')
          const empresa = JSON.parse(empresaStr)
          const verificado = await authContext.verificarLiberacaoDispositivo(empresa.id)

          if (!verificado) {
            authContext.signOut()
          }

          await updateConfig()
          await updatePermissions()

          dispatch({ type: 'CHANGE_MESSAGE', message: 'Sincronização realizada com sucesso!' })
        } catch (error) {
          dispatch({ type: 'SYNC_FINISH' })
          dispatch({ type: 'CHANGE_MESSAGE', message: error.message })
        } finally {
          setTimeout(() => {
            dispatch({ type: 'SYNC_FINISH' })
          }, 2000)
        }
      } else {
        Alert.alert('Offline', 'Não foi possível sincronizar, você está offline!')
      }
    },
    ...state
  }), [authContext, state, trabalhaComCompras, trabalhaComVendas])

  if (!authContext?.userInfo) {
    return <View>
      <Text>Teste</Text>
    </View>
  }

  const isZaloar = authContext?.userInfo?.empresa === 'AGYZAL COMERCIO E REPRESENTACAO LTDA - ME'

  return (
    <SyncContext.Provider value={syncContext}>
      <Drawer.Navigator drawerContent={props => <>
        <View style={{ backgroundColor: defaultStyle.background2.backgroundColor, padding: 15 }}>
          <View style={{ paddingTop: Constants.statusBarHeight }}>
            <Text style={{ color: textPrimaryColor, fontSize: 25 }}>{authContext?.userInfo?.nome}</Text>
            <Text style={{ color: textPrimaryColor, fontSize: 16 }}>{authContext?.userInfo?.subEmpresa}</Text>
            <Text onPress={() => {
              Clipboard.setString(uniqueId)
              alert('Copiado com sucesso!')
            }} style={{ color: textPrimaryColor, fontSize: 16 }}>ID: {uniqueId}</Text>
          </View>
        </View>
        <ScrollView>
          <DrawerItemList {...props} />
        </ScrollView>
      </>} drawerStyle={{ backgroundColor }} drawerContentOptions={{ labelStyle: { color: textPrimaryColor } }} initialRouteName={trabalhaComCompras ? 'Compras' : 'Pedidos'}>
        {trabalhaComVendas && !isZaloar && <Drawer.Screen name="Dashboard" component={StackNavigationDashboard} options={{ drawerLabel: 'Dashboard', drawerIcon: () => <MaterialCommunityIcons name="monitor-dashboard" size={23} color={textPrimaryColor} /> }} />}
        {trabalhaComVendas && <Drawer.Screen name="Pedidos" component={StackNavigationPedido} options={{ drawerLabel: 'Pedidos', drawerIcon: () => <AntDesign name="profile" size={23} color={textPrimaryColor} /> }} />}
        {trabalhaComCompras && <Drawer.Screen name="Compras" component={StackNavigationCompra} options={{ drawerLabel: 'Compras', drawerIcon: () => <AntDesign name="shoppingcart" size={23} color={textPrimaryColor} /> }} />}
        <Drawer.Screen name="Estoque" component={StackNavigationEstoque} options={{ drawerLabel: 'Estoque', drawerIcon: () => <MaterialCommunityIcons name="warehouse" size={23} color={textPrimaryColor} /> }} />
        {trabalhaComVendas && <Drawer.Screen name="Clientes" component={StackNavigationCliente} options={{ drawerLabel: 'Clientes', drawerIcon: () => <AntDesign name="user" size={23} color={textPrimaryColor} /> }} />}
        {trabalhaComCompras && <Drawer.Screen name="Fornecedores" component={StackNavigationFornecedor} options={{ drawerLabel: 'Fornecedores', drawerIcon: () => <AntDesign name="user" size={23} color={textPrimaryColor} /> }} />}
        <Drawer.Screen name="Financeiro" component={StackNavigationFinanceiro} options={{ drawerLabel: 'Financeiro', drawerIcon: () => <AntDesign name="linechart" size={23} color={textPrimaryColor} /> }} />
        <Drawer.Screen name="SyncCidades" component={StackNavigationCidades} options={{ drawerLabel: 'Sincronizar cidades', drawerIcon: () => <SimpleLineIcons name="location-pin" size={23} color={textPrimaryColor} /> }} />
        <Drawer.Screen name="Backups" component={StackNavigationBackups} options={{ drawerLabel: 'Backups', drawerIcon: () => <AntDesign name="copy1" size={23} color={textPrimaryColor} /> }} />
        <Drawer.Screen name="LimparDados" component={StackNavigationLimparDados} options={{ drawerLabel: 'Limpar Dados', drawerIcon: () => <AntDesign name="delete" size={23} color={textPrimaryColor} /> }} />
        <Drawer.Screen name="Trocar Empresa" component={StackNavigationTrocarEmpresa} options={{ drawerLabel: 'Trocar Empresa', drawerIcon: () => <Fontisto name="arrow-swap" size={23} color={textPrimaryColor} /> }} />
        <Drawer.Screen name="Sair" component={StackNavigationLogout} options={{ style: { marginTop: 80 }, drawerLabel: 'Sair', drawerIcon: () => (<AntDesign name="logout" size={23} color={textPrimaryColor} />) }} />
      </Drawer.Navigator>
    </SyncContext.Provider>

  )
}

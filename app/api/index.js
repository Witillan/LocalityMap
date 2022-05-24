import AsyncStorage from '@react-native-async-storage/async-storage'
import LogDAO from '../db/LogDao'
import { updateConfig } from '../hooks/useConfig'
import { updatePermissions } from '../hooks/usePermissions'
import { ClienteService } from './cliente'
import { CompraService } from './compra'
import { EstoqueService } from './estoque'
import { FinanceiroService } from './financeiro'
import { FormaPagamentoService } from './formaPagamento'
import { FornecedorService } from './fornecedor'
import { GrupoProdutoService } from './grupoProduto'
import { LogService } from './log'
import { MarcaProdutoService } from './marcaProduto'
import { PedidoService } from './pedido'
import { ProdutoService } from './produto'
import { UnidadeProdutoService } from './unidadeProduto'

export const sincronizacaoGeral = async () => {
  try {
    await updateConfig()
    await updatePermissions()

    const userInfo = JSON.parse(await AsyncStorage.getItem('UserInfo'))
    // Forma de pagamento
    await FormaPagamentoService.Sincronizar()

    // Unidades
    await UnidadeProdutoService.Sincronizar()

    // Marcas
    await MarcaProdutoService.Sincronizar()

    // Grupos
    await GrupoProdutoService.Sincronizar()

    // Produtos
    await ProdutoService.Sincronizar()

    // Clientes
    if (userInfo.role === 'Consultor geral' || userInfo.role === 'Consultor de vendas') {
      await ClienteService.Sincronizar()
    }

    // Fornecedores
    if (userInfo.role === 'Consultor geral' || userInfo.role === 'Consultor de compras') {
      await FornecedorService.Sincronizar()
    }

    // Estoques
    await EstoqueService.Sincronizar()

    // Pedidos
    if (userInfo.role === 'Consultor geral' || userInfo.role === 'Consultor de vendas') {
      await PedidoService.Sincronizar()
    }

    // Compras
    if (userInfo.role === 'Consultor geral' || userInfo.role === 'Consultor de compras') {
      await CompraService.Sincronizar()
    }

    // Financeiro
    await FinanceiroService.Sincronizar()

    // Logs
    await LogService.Sincronizar()
  } catch (error) {
    LogDAO.GravarLog(error.message)
  }
}

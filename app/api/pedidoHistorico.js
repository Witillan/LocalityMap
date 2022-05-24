import HistoricoPedidoDao from '../db/HistoricoPedidoDao'
import { getApiUrl, getRequestOptions } from '../util/fetch'
import LogDAO from '../db/LogDao'

export class PedidoHistoricoService {
  static async Sincronizar (dataInicial, dataFinal, clienteId) {
    // Consultando no DB os ids para verificar o que foi removido
    await HistoricoPedidoDao.RemoveAll()

    // Consulta na API os registros criados/alterados
    const responseHistorico = await fetch(`${await getApiUrl()}/Pedidos/ConsultarHistorico/${dataInicial}/${dataFinal}/${clienteId}`, await getRequestOptions('GET'))

    if (!responseHistorico.ok) {
      await LogDAO.GravarLog(await responseHistorico.text())
      throw new Error(`Ocorreu um erro ${responseHistorico.status} ao sincronizar os históricos no passo 2`)
    }
    // Obtendo o json dos registros novos e alterados
    const criadosOuAlterados = await responseHistorico.json()

    // Salvando eles na API
    await HistoricoPedidoDao.AddOrReplaceFromAPI(criadosOuAlterados)
  }

  static async RemoverTodos () {
    await HistoricoPedidoDao.RemoveAll()
  }
}

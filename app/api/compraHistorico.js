import HistoricoCompraDao from '../db/HistoricoCompraDao'
import { getApiUrl, getRequestOptions } from '../util/fetch'
import LogDAO from '../db/LogDao'

export class CompraHistoricoService {
  static async Sincronizar (dataInicial, dataFinal, fornecedorId) {
    // Consultando no DB os ids para verificar o que foi removido
    await HistoricoCompraDao.RemoveAll()

    // Consulta na API os registros criados/alterados
    const responseHistorico = await fetch(`${await getApiUrl()}/Compras/ConsultarHistorico/${dataInicial}/${dataFinal}/${fornecedorId}`, await getRequestOptions('GET'))

    if (!responseHistorico.ok) {
      await LogDAO.GravarLog(await responseHistorico.text())
      throw new Error(`Ocorreu um erro ${responseHistorico.status} ao sincronizar os históricos no passo 2`)
    }
    // Obtendo o json dos registros novos e alterados
    const criadosOuAlterados = await responseHistorico.json()

    // Salvando eles na API
    await HistoricoCompraDao.AddOrReplaceFromAPI(criadosOuAlterados)
  }

  static async RemoverTodos () {
    await HistoricoCompraDao.RemoveAll()
  }
}

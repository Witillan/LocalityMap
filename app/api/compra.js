import CompraDAO from '../db/CompraDao'
import { getApiUrl, getRequestOptions } from '../util/fetch'
import LogDAO from '../db/LogDao'

export class CompraService {
  static async Sincronizar () {
    // Obtém os registros a inserir
    const registrosAInserir = await CompraDAO.GetComprasCriados()

    if (registrosAInserir.length) {
      // Chama a API para inserir
      const responseInserir = await fetch(`${await getApiUrl()}/Compras/SalvarEmLote`, await getRequestOptions('POST', true, registrosAInserir))

      // Se a response for não for ok lança um erro
      if (!responseInserir.ok) {
        const resposta = await responseInserir.text()
        await LogDAO.GravarLog(resposta)
        throw new Error(`Ocorreu um erro ${resposta} ao transmitir as compras`)
      }

      await CompraDAO.RemoveByTempId(registrosAInserir.map(item => item.tempId))
    }

    // Consultando no DB os ids para verificar o que foi removido
    const registrosComparacaoExclusao = await CompraDAO.GetListComparacaoRemocao()

    if (registrosComparacaoExclusao.length) {
      // Chama a API e ela retornará um array com os ids que não existem lá (logo foram removidos)
      const responseObterRemovidos = await fetch(`${await getApiUrl()}/Compras/ObterRegistrosRemovidos`, await getRequestOptions('POST', true, registrosComparacaoExclusao))

      // Se a response for não for ok lança um erro
      if (!responseObterRemovidos.ok) {
        await LogDAO.GravarLog(await responseObterRemovidos.text())
        throw new Error(`Ocorreu um erro ${responseObterRemovidos.status} ao verificar os compras removidos`)
      }
      // Recebe o array de ids removidos
      const removidos = await responseObterRemovidos.json()

      // Enfim remove os registros removidos na API
      await CompraDAO.Remove(removidos)
    }

    // Busca no DB os ids e timestamps de criação e alteração para verificar o que foi alterado/criado
    const registrosComparacaoAlteracao = await CompraDAO.GetListComparacaoAlteracoes()

    // Consulta na API os registros criados/alterados
    const responseObterAlterados = await fetch(`${await getApiUrl()}/Compras/ObterRegistrosComparados`, await getRequestOptions('POST', true, registrosComparacaoAlteracao))

    if (!responseObterAlterados.ok) {
      await LogDAO.GravarLog(await responseObterAlterados.text())
      throw new Error(`Ocorreu um erro ${responseObterAlterados.status} ao receber compras da web`)
    }
    // Obtendo o json dos registros novos e alterados
    const criadosOuAlterados = await responseObterAlterados.json()

    // Salvando eles na API
    await CompraDAO.AddOrReplaceFromAPI(criadosOuAlterados)
  }

  static async RemoverTodos () {
    await CompraDAO.RemoveAll()
  }
}

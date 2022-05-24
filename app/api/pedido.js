import PedidoDAO from '../db/PedidoDao'
import { getApiUrl, getRequestOptions } from '../util/fetch'
import LogDAO from '../db/LogDao'

export class PedidoService {
  static async Sincronizar (diasAnteriores = null) {
    await PedidoService.EnviarNovos()

    // Consultando no DB os ids para verificar o que foi removido
    const registrosComparacaoExclusao = await PedidoDAO.GetListComparacaoRemocao()

    if (registrosComparacaoExclusao.length) {
      // Chama a API e ela retornará um array com os ids que não existem lá (logo foram removidos)
      const responseObterRemovidos = await fetch(`${await getApiUrl()}/Pedidos/ObterRegistrosRemovidos`, await getRequestOptions('POST', true, registrosComparacaoExclusao))

      // Se a response for não for ok lança um erro
      if (!responseObterRemovidos.ok) {
        await LogDAO.GravarLog(await responseObterRemovidos.text())
        throw new Error(`Ocorreu um erro ${responseObterRemovidos.status} ao verificar os pedidos removidos`)
      }
      // Recebe o array de ids removidos
      const removidos = await responseObterRemovidos.json()

      // Enfim remove os registros removidos na API
      await PedidoDAO.Remove(removidos)
    }

    // Busca no DB os ids e timestamps de criação e alteração para verificar o que foi alterado/criado
    const registrosComparacaoAlteracao = await PedidoDAO.GetListComparacaoAlteracoes()
    let url = `${await getApiUrl()}/Pedidos/ObterRegistrosComparados`

    if (diasAnteriores) {
      url += `?diasAnteriores=${diasAnteriores}`
    }

    // Consulta na API os registros criados/alterados
    const responseObterAlterados = await fetch(url, await getRequestOptions('POST', true, registrosComparacaoAlteracao))

    if (!responseObterAlterados.ok) {
      await LogDAO.GravarLog(await responseObterAlterados.text())
      throw new Error(`Ocorreu um erro ${responseObterAlterados.status} ao receber pedidos da web`)
    }
    // Obtendo o json dos registros novos e alterados
    const criadosOuAlterados = await responseObterAlterados.json()

    // Salvando eles na API
    await PedidoDAO.AddOrReplaceFromAPI(criadosOuAlterados)
  }

  static async RemoverTodos () {
    await PedidoDAO.RemoveAll()
  }

  static async EnviarNovos () {
    // Obtém os registros a inserir
    const registrosAInserir = await PedidoDAO.GetPedidosCriados()

    if (registrosAInserir.length) {
      // Chama a API para inserir
      const responseInserir = await fetch(`${await getApiUrl()}/Pedidos/SalvarEmLote`, await getRequestOptions('POST', true, registrosAInserir))

      // Se a response for não for ok lança um erro
      if (!responseInserir.ok) {
        const resposta = await responseInserir.text()
        await LogDAO.GravarLog(resposta)
        throw new Error(`Ocorreu um erro ${resposta} ao transmitir os pedidos`)
      }

      await PedidoDAO.RemoveByTempId(registrosAInserir.map(item => item.tempId))
    }
  }
}

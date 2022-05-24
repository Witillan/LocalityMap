import GrupoProdutoDAO from '../db/GrupoProdutoDao'
import { getApiUrl, getRequestOptions } from '../util/fetch'
import LogDAO from '../db/LogDao'

export class GrupoProdutoService {
  static async Sincronizar () {
    // Consultando no DB os ids para verificar o que foi removido
    const registrosComparacaoExclusao = await GrupoProdutoDAO.GetListComparacaoRemocao()

    if (registrosComparacaoExclusao.length) {
      // Chama a API e ela retornará um array com os ids que não existem lá (logo foram removidos)
      const responseObterRemovidos = await fetch(`${await getApiUrl()}/GruposProduto/ObterRegistrosRemovidos`, await getRequestOptions('POST', true, registrosComparacaoExclusao))

      // Se a response for não for ok lança um erro
      if (!responseObterRemovidos.ok) {
        await LogDAO.GravarLog(await responseObterRemovidos.text())
        throw new Error(`Ocorreu um erro ${responseObterRemovidos.status} ao sincronizar os grupos de produto no passo 1`)
      }
      // Recebe o array de ids removidos
      const removidos = await responseObterRemovidos.json()

      // Enfim remove os registros removidos na API
      await GrupoProdutoDAO.Remove(removidos)
    }

    // Busca no DB os ids e timestamps de criação e alteração para verificar o que foi alterado/criado
    const registrosComparacaoAlteracao = await GrupoProdutoDAO.GetListComparacaoAlteracoes()

    // Consulta na API os registros criados/alterados
    const responseObterAlterados = await fetch(`${await getApiUrl()}/GruposProduto/ObterRegistrosComparados`, await getRequestOptions('POST', true, registrosComparacaoAlteracao))

    if (!responseObterAlterados.ok) {
      await LogDAO.GravarLog(await responseObterAlterados.text())
      throw new Error(`Ocorreu um erro ${responseObterAlterados.status} ao sincronizar os grupos de produto no passo 2`)
    }
    // Obtendo o json dos registros novos e alterados
    const criadosOuAlterados = await responseObterAlterados.json()

    // Salvando eles na API
    await GrupoProdutoDAO.AddOrReplaceFromAPI(criadosOuAlterados)
  }

  static async RemoverTodos () {
    await GrupoProdutoDAO.RemoveAll()
  }
}

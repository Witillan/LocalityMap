import FornecedorDAO from '../db/FornecedorDao'
import { getApiUrl, getRequestOptions } from '../util/fetch'
import LogDAO from '../db/LogDao'

export class FornecedorService {
  static async Sincronizar () {
    // Insere na API registros novos :)
    const registrosAdicionados = await FornecedorDAO.GetListAdicionadosEAlterados()

    if (registrosAdicionados.length) {
      // Chama a API e ela retornará um array com os ids que não existem lá (logo foram removidos)
      const responseAdicionados = await fetch(`${await getApiUrl()}/Fornecedores/SalvarEmLote`, await getRequestOptions('POST', true, registrosAdicionados))

      // Trata a response de inserção
      if (!responseAdicionados.ok) {
        await LogDAO.GravarLog(await responseAdicionados.text())
        throw new Error(`Ocorreu um erro ${responseAdicionados.status} ao sincronizar as fornecedores no passo 1`)
      }

      // Remove os registros inseridos em lote para obter mais a frente o registro com id
      await FornecedorDAO.RemoveByTempId(registrosAdicionados.map(item => item.tempId))
    }

    // Consultando no DB os ids para verificar o que foi removido
    const registrosComparacaoExclusao = await FornecedorDAO.GetListComparacaoRemocao()

    if (registrosComparacaoExclusao.length) {
      // Chama a API e ela retornará um array com os ids que não existem lá (logo foram removidos)
      const responseObterRemovidos = await fetch(`${await getApiUrl()}/Fornecedores/ObterRegistrosRemovidos`, await getRequestOptions('POST', true, registrosComparacaoExclusao))

      // Se a response for não for ok lança um erro
      if (!responseObterRemovidos.ok) {
        await LogDAO.GravarLog(await responseObterRemovidos.text())
        throw new Error(`Ocorreu um erro ${responseObterRemovidos.status} ao sincronizar as fornecedores no passo 2`)
      }
      // Recebe o array de ids removidos
      const removidos = await responseObterRemovidos.json()

      // Enfim remove os registros removidos na API
      await FornecedorDAO.Remove(removidos)
    }

    // Busca no DB os ids e timestamps de criação e alteração para verificar o que foi alterado/criado
    const registrosComparacaoAlteracao = await FornecedorDAO.GetListComparacaoAlteracoes()

    // Consulta na API os registros criados/alterados
    const responseObterAlterados = await fetch(`${await getApiUrl()}/Fornecedores/ObterRegistrosComparados`, await getRequestOptions('POST', true, registrosComparacaoAlteracao))

    if (!responseObterAlterados.ok) {
      await LogDAO.GravarLog(await responseObterAlterados.text())
      throw new Error(`Ocorreu um erro ${responseObterAlterados.status} ao sincronizar as fornecedores no passo 3`)
    }
    // Obtendo o json dos registros novos e alterados
    const criadosOuAlterados = await responseObterAlterados.json()

    // Salvando eles na API
    await FornecedorDAO.AddOrReplaceFromAPI(criadosOuAlterados)
  }

  static async RemoverTodos () {
    await FornecedorDAO.RemoveAll()
  }
}

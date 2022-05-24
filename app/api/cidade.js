import CidadeDAO from '../db/CidadeDao'
import LogDAO from '../db/LogDao'

export class CidadeService {
  static async Obter () {
    //  Consulta cidades no IBGE
    const response = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/municipios?orderBy=nome')

    // Valida response
    if (!response.ok) {
      await LogDAO.GravarLog(await response.text())
      throw new Error(`Ocorreu um erro ${response.status} ao obter as cidades do IBGE. Entre em contato com o suporte Alpha Software`)
    }

    // Deserializa json
    const cidades = await response.json()

    // Salva no db
    await CidadeDAO.AddOrReplaceFromAPI(cidades)
  }

  static async RemoverTodos () {
    await CidadeDAO.RemoveAll()
  }
}

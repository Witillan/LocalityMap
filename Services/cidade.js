import CidadeDAO from '../db/CidadeDao'

export class CidadeService {
  static async Obter () {
    //  Consulta cidades no IBGE
    const response = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/municipios?orderBy=nome')

    // Valida response
    if (!response.ok) {
      throw new Error(`Ocorreu um erro ${response.status} ao obter as cidades.`)
    }

    // Deserializa json
    const cidades = await response.json()

    // Salva no db
    await CidadeDAO.Insert(cidades)
  }
}

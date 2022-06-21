import PaisDAO from '../db/PaisDao'

export class PaisService {
  static async Obter () {
    //  Consulta paises no IBGE
    const response = await fetch('https://servicodados.ibge.gov.br/api/v1/paises')

    // Valida response
    if (!response.ok) {
      throw new Error(`Ocorreu um erro ${response.status} ao obter os paises.`)
    }

    // Deserializa json
    const paises = await response.json()

    // Salva no db
    await PaisDAO.Insert(paises)
  }
}

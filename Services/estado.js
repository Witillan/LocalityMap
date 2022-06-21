import EstadoDAO from '../db/EstadoDao'

export class EstadoService {
  static async Obter () {
    //  Consulta estados no IBGE
    const response = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados')

    // Valida response
    if (!response.ok) {
      throw new Error(`Ocorreu um erro ${response.status} ao obter os estados.`)
    }

    // Deserializa json
    const estados = await response.json()

    // Salva no db
    await EstadoDAO.Insert(estados)
  }
}

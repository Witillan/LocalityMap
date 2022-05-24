import Sqlite from './Sqlite'

export default class CidadeDAO {
  static AddOrReplaceFromAPI (values) {
    return new Promise((resolve, reject) => {
      const db = Sqlite.getDb()

      db.transaction(tx => {
        values.forEach(item => {
          tx.executeSql('insert or replace into Cidade values (?,?,?)', [item.id, item.nome, item.microrregiao.mesorregiao.UF.sigla])
        })
      }, reject, resolve)
    })
  }

  static GetListAll () {
    return new Promise((resolve, reject) => {
      const db = Sqlite.getDb()

      const query = 'select * from Cidade'

      db.transaction(tx => {
        tx.executeSql(query, [], (_, { rows }) => resolve(rows._array), (_, error) => { return reject(error) })
      })
    })
  }

  static Count () {
    return new Promise((resolve, reject) => {
      const db = Sqlite.getDb()

      const query = 'select count(codigoIbge) from Cidade'

      db.transaction(tx => {
        tx.executeSql(query, [], (_, { rows }) => resolve(rows._array[0]['count(codigoIbge)']), (_, error) => { return reject(error) })
      })
    })
  }

  static GetByCodigoIbge (codigoIbge) {
    return new Promise((resolve, reject) => {
      const db = Sqlite.getDb()

      const query = `select * from Cidade where codigoIbge = '${codigoIbge}'`

      db.transaction(tx => {
        tx.executeSql(query, [], (_, { rows }) => resolve(rows._array[0]), (_, error) => { return reject(error) })
      })
    })
  }

  static Remove (values) {
    return new Promise((resolve, reject) => {
      const db = Sqlite.getDb()

      db.transaction(tx => {
        tx.executeSql(`delete from Cidade where Id in (${values.map(item => `'${item}'`).join(',')})`)
      }, reject, resolve)
    })
  }

  static RemoveAll () {
    return new Promise((resolve, reject) => {
      const db = Sqlite.getDb()

      db.transaction(tx => {
        tx.executeSql('delete from Cidade')
      }, reject, resolve)
    })
  }

  static Delete () {
    return new Promise((resolve, reject) => {
      const db = Sqlite.getDb()

      db.transaction(tx => {
        tx.executeSql('delete from Cidade')
      }, reject, resolve)
    })
  }

  static GetByUf (uf) {
    return new Promise((resolve, reject) => {
      const db = Sqlite.getDb()

      const query = `select * from Cidade where uf = '${uf}'`

      db.transaction(tx => {
        tx.executeSql(query, [], (_, { rows }) => {
          return resolve(rows._array)
        }, (_, error) => { return reject(error) })
      })
    })
  }

  static ListUFs () {
    return [
      { nome: 'Acre', sigla: 'AC' },
      { nome: 'Alagoas', sigla: 'AL' },
      { nome: 'Amapá', sigla: 'AP' },
      { nome: 'Amazonas', sigla: 'AM' },
      { nome: 'Bahia', sigla: 'BA' },
      { nome: 'Ceará', sigla: 'CE' },
      { nome: 'Distrito Federal', sigla: 'DF' },
      { nome: 'Espírito Santo', sigla: 'ES' },
      { nome: 'Goiás', sigla: 'GO' },
      { nome: 'Maranhão', sigla: 'MA' },
      { nome: 'Mato Grosso', sigla: 'MT' },
      { nome: 'Mato Grosso do Sul', sigla: 'MS' },
      { nome: 'Minas Gerais', sigla: 'MG' },
      { nome: 'Pará', sigla: 'PA' },
      { nome: 'Paraíba', sigla: 'PB' },
      { nome: 'Paraná', sigla: 'PR' },
      { nome: 'Pernambuco', sigla: 'PE' },
      { nome: 'Piauí', sigla: 'PI' },
      { nome: 'Rio de Janeiro', sigla: 'RJ' },
      { nome: 'Rio Grande do Norte', sigla: 'RN' },
      { nome: 'Rio Grande do Sul', sigla: 'RS' },
      { nome: 'Rondônia', sigla: 'RO' },
      { nome: 'Roraima', sigla: 'RR' },
      { nome: 'Santa Catarina', sigla: 'SC' },
      { nome: 'São Paulo', sigla: 'SP' },
      { nome: 'Sergipe', sigla: 'SE' },
      { nome: 'Tocantins', sigla: 'TO' }
    ]
  }
}

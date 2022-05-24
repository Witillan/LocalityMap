import AsyncStorage from '@react-native-async-storage/async-storage'
import Sqlite from './Sqlite'

export default class FinanceiroDAO {
  static AddOrReplaceFromAPI (values) {
    return new Promise((resolve, reject) => {
      const db = Sqlite.getDb()

      db.transaction(tx => {
        values.forEach(item => {
          tx.executeSql('insert or replace into Financeiro values (?,?,?,?,?,?,?,?,?,?,?,?,?)', [item.id, item.idAlphaExpress, item.numero, item.tipoDocumento, item.clienteId, item.subEmpresaId, item.valor, item.dataVencimento, item.dataPagamento, item.situacao, item.empresaId, item.dataCriacao, item.dataAlteracao])
        })
      }, reject, resolve)
    })
  }

  static GetByCliente (clienteId) {
    return new Promise((resolve, reject) => {
      const db = Sqlite.getDb()

      let query = `
          SELECT f.id, f.dataPagamento, f.dataVencimento, f.idAlphaExpress, f.numero, f.situacao, f.tipoDocumento, f.valor, c.apelido, c.vendedores, c.nomeRazao
          FROM Financeiro f
          INNER JOIN Cliente c ON c.id = f.clienteId
        `

      const clauses = [`f.clienteId = '${clienteId}'`, 'f.situacao <> \'Quitado\'']

      if (clauses.length) {
        query += ` WHERE ${clauses.join(' AND ')}`
      }

      query += ' ORDER BY f.dataVencimento DESC'

      db.transaction(tx => {
        tx.executeSql(query, [], (_, { rows }) => resolve(rows._array), (_, error) => { return reject(error) })
      })
    })
  }

  static Filter ({ filtros }, dateEntrada, dateSaida, offset) {
    return new Promise((resolve, reject) => {
      AsyncStorage.multiGet(['Empresa', 'SubEmpresaId']).then(([empresaStr, subEmpresaStr]) => {
        const db = Sqlite.getDb()

        const empresa = JSON.parse(empresaStr[1])
        const subEmpresaId = subEmpresaStr[1]

        let query = `
          SELECT f.id, f.dataPagamento, f.dataVencimento, f.idAlphaExpress, f.numero, f.situacao, f.tipoDocumento, f.valor, c.apelido, c.vendedores, c.nomeRazao
          FROM Financeiro f
          INNER JOIN Cliente c ON c.id = f.clienteId
        `

        const clauses = [`f.empresaId = '${empresa.id}' AND f.subEmpresaId = '${subEmpresaId}'`]

        if (filtros.tipoData === 'vencimento') {
          if (dateEntrada && dateSaida) {
            clauses.push(`f.dataVencimento >= '${dateEntrada}' AND f.dataVencimento <= '${dateSaida}'`)
          }
        } else if (filtros.tipoData === 'pagamento') {
          if (dateEntrada && dateSaida) {
            clauses.push(`f.dataPagamento >= '${dateEntrada}' AND f.dataPagamento <= '${dateSaida}'`)
          }
        }

        if (filtros.nomeRazao) {
          clauses.push(`c.nomeRazao like '%${filtros.nomeRazao}%'`)
        }

        if (filtros.situacao) {
          if (filtros.situacao === 'aberto') {
            clauses.push('f.situacao = \'Aberto\'')
          } else if (filtros.situacao === 'quitado') {
            clauses.push('f.situacao = \'Quitado\'')
          }
        }

        if (clauses.length) {
          query += ` WHERE ${clauses.join(' AND ')}`
        }

        if (filtros.tipoData) {
          if (filtros.tipoData === 'vencimento') {
            query += ' ORDER BY f.dataVencimento DESC'
          } else if (filtros.tipoData === 'pagamento') {
            query += ' ORDER BY f.dataPagamento DESC'
          }
        } else {
          query += ' ORDER BY f.dataVencimento DESC'
        }

        query += ' limit 10'
        query += ' offset ?'

        db.transaction(tx => {
          tx.executeSql(query, [offset], (_, { rows }) => resolve(rows._array), (_, error) => { return reject(error) })
        })
      })
    })
  }

  static GetList () {
    return new Promise((resolve, reject) => {
      AsyncStorage.multiGet(['Empresa', 'SubEmpresaId']).then(([empresaStr, subEmpresaStr]) => {
        const db = Sqlite.getDb()

        const empresa = JSON.parse(empresaStr[1])
        const subEmpresaId = subEmpresaStr[1]

        const query = `select * from Financeiro where empresaId = '${empresa.id}' and subEmpresaId = '${subEmpresaId}'`

        db.transaction(tx => {
          tx.executeSql(query, [], (_, { rows }) => resolve(rows._array), (_, error) => { return reject(error) })
        })
      })
    })
  }

  static GetCount () {
    return new Promise((resolve, reject) => {
      AsyncStorage.multiGet(['Empresa', 'SubEmpresaId', 'UserInfo', 'Configuracoes']).then(([empresaStr, subEmpresaStr, userInfoStr, configStr]) => {
        const db = Sqlite.getDb()

        const empresa = JSON.parse(empresaStr[1])
        const subEmpresaId = subEmpresaStr[1]
        const user = JSON.parse(userInfoStr[1])
        const config = JSON.parse(configStr[1])
        const isByRegion = config[0].clientePorRegiao

        let query = `select count(f.id) as contagem from Financeiro f
        inner join Cliente c ON c.id = f.clienteId`

        const clauses = [`f.empresaId = '${empresa.id}' and f.subEmpresaId = '${subEmpresaId}'`]

        if (isByRegion) {
          clauses.push(`c.vendedores like '%${user.idAlphaExpress}%'`)
        }

        if (clauses.length) {
          query += ` where ${clauses.join(' and ')}`
        }

        db.transaction(tx => {
          tx.executeSql(query, [], (_, { rows }) => resolve(rows._array.map(item => item.contagem).reduce((prev, curr) => prev + curr)), (_, error) => { return reject(error) })
        })
      })
    })
  }

  static Remove (values) {
    return new Promise((resolve, reject) => {
      AsyncStorage.getItem('Empresa').then((empresaStr) => {
        const db = Sqlite.getDb()

        const empresa = JSON.parse(empresaStr)

        db.transaction(tx => {
          tx.executeSql(`delete from Financeiro where empresaId = '${empresa.id}' and Id in (${values.map(item => `'${item}'`).join(',')})`)
        }, reject, resolve)
      })
    })
  }

  static RemoveAll () {
    return new Promise((resolve, reject) => {
      AsyncStorage.getItem('Empresa').then((empresaStr) => {
        const db = Sqlite.getDb()

        const empresa = JSON.parse(empresaStr)

        db.transaction(tx => {
          tx.executeSql(`delete from Financeiro where empresaId = '${empresa.id}'`)
        }, reject, resolve)
      })
    })
  }

  static Delete () {
    return new Promise((resolve, reject) => {
      const db = Sqlite.getDb()

      db.transaction(tx => {
        tx.executeSql('delete from Financeiro')
      }, reject, resolve)
    })
  }

  static GetListComparacaoAlteracoes () {
    return new Promise((resolve, reject) => {
      AsyncStorage.getItem('Empresa').then((empresaStr) => {
        const db = Sqlite.getDb()

        const empresa = JSON.parse(empresaStr)

        const query = `select id, dataCriacao, dataAlteracao from Financeiro where empresaId = '${empresa.id}'`

        db.transaction(tx => {
          tx.executeSql(query, [], (_, { rows }) => resolve(rows._array), (_, error) => { return reject(error) })
        })
      })
    })
  }

  static GetListComparacaoRemocao () {
    return new Promise((resolve, reject) => {
      AsyncStorage.getItem('Empresa').then((empresaStr) => {
        const db = Sqlite.getDb()

        const empresa = JSON.parse(empresaStr)

        const query = `select id from Financeiro where empresaId = '${empresa.id}'`

        db.transaction(tx => {
          tx.executeSql(query, [], (_, { rows }) => resolve(rows._array.map(item => item.id)), (_, error) => { return reject(error) })
        })
      })
    })
  }
}

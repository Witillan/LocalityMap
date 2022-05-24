import AsyncStorage from '@react-native-async-storage/async-storage'
import Sqlite from './Sqlite'

export default class FormaPagamentoDAO {
  static AddOrReplaceFromAPI (values) {
    return new Promise((resolve, reject) => {
      const db = Sqlite.getDb()

      db.transaction(tx => {
        values.forEach(item => {
          tx.executeSql('insert or replace into FormaPagamento values (?,?,?,?,?,?,?,?)', [item.id, item.idAlphaExpress, item.nome, item.tipo, item.empresaId, item.dataCriacao, item.dataAlteracao, item.tabelaPrecoId])
        })
      }, reject, resolve)
    })
  }

  static GetList () {
    return new Promise((resolve, reject) => {
      AsyncStorage.getItem('Empresa').then((empresaStr) => {
        const db = Sqlite.getDb()

        const empresa = JSON.parse(empresaStr)

        const query = `select * from FormaPagamento where empresaId = '${empresa.id}' order by nome ASC`

        db.transaction(tx => {
          tx.executeSql(query, [], (_, { rows }) => { resolve(rows._array) }, (_, error) => { return reject(error) })
        })
      })
    })
  }

  static GetById (id) {
    return new Promise((resolve, reject) => {
      AsyncStorage.getItem('Empresa').then((empresaStr) => {
        const db = Sqlite.getDb()

        const empresa = JSON.parse(empresaStr)

        const query = `select * from FormaPagamento where empresaId = '${empresa.id}' and id = '${id}'`

        db.transaction(tx => {
          tx.executeSql(query, [], (_, { rows }) => resolve(rows._array), (_, error) => { return reject(error) })
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
          tx.executeSql(`delete from FormaPagamento where empresaId = '${empresa.id}' and Id in (${values.map(item => `'${item}'`).join(',')})`)
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
          tx.executeSql(`delete from FormaPagamento where empresaId = '${empresa.id}'`)
        }, reject, resolve)
      })
    })
  }

  static Delete () {
    return new Promise((resolve, reject) => {
      const db = Sqlite.getDb()

      db.transaction(tx => {
        tx.executeSql('delete from FormaPagamento')
      }, reject, resolve)
    })
  }

  static GetListComparacaoAlteracoes () {
    return new Promise((resolve, reject) => {
      AsyncStorage.getItem('Empresa').then((empresaStr) => {
        const db = Sqlite.getDb()

        const empresa = JSON.parse(empresaStr)

        const query = `select id, dataCriacao, dataAlteracao from FormaPagamento where empresaId = '${empresa.id}'`

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

        const query = `select id from FormaPagamento where empresaId = '${empresa.id}'`

        db.transaction(tx => {
          tx.executeSql(query, [], (_, { rows }) => resolve(rows._array.map(item => item.id)), (_, error) => { return reject(error) })
        })
      })
    })
  }
}

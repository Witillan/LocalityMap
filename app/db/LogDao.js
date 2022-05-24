import AsyncStorage from '@react-native-async-storage/async-storage'
import Sqlite from './Sqlite'
import { createUUID } from '../util/guid'

export default class LogDAO {
  static GravarLog (mensagem) {
    return new Promise((resolve, reject) => {
      const db = Sqlite.getDb()

      mensagem = mensagem.length > 5000 ? mensagem.substr(0, 5000) : mensagem

      AsyncStorage.getItem('SubEmpresaId').then(subEmpresaId => {
        db.transaction(tx => {
          tx.executeSql('insert or replace into Log values (?,?,?,?)', [createUUID(), 0, mensagem, subEmpresaId])
        }, reject, resolve)
      })
    })
  }

  static GetList () {
    return new Promise((resolve, reject) => {
      AsyncStorage.multiGet(['SubEmpresaId']).then(([subEmpresa]) => {
        const db = Sqlite.getDb()

        const subEmpresaId = subEmpresa[1]

        const query = `select * from Log where subEmpresaId = '${subEmpresaId}'`

        db.transaction(tx => {
          tx.executeSql(query, [], (_, { rows }) => resolve(rows._array), (_, error) => { return reject(error) })
        })
      })
    })
  }

  static RemoveAll () {
    return new Promise((resolve, reject) => {
      const db = Sqlite.getDb()
      db.transaction(tx => {
        tx.executeSql('delete from Log')
      }, reject, resolve)
    })
  }
}

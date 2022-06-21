import { Platform } from 'react-native'
import Sqlite from './Sqlite'

export default class EstadosDao {
    static Insert (values) {
        return new Promise((resolve, reject) => {
          const db = Sqlite.getDb()
    
          db.transaction(tx => {
            values.forEach(item => {
              tx.executeSql('insert or replace into Estados values (?,?,?,?,?)', [item.id, item.regiao.id, 76, item.sigla, item.nome])
            })
          }, reject, resolve)
        })
      }

    static GetEstados() {
        return new Promise((resolve, reject) => {
            const db = Sqlite.getDb()

            const query = 'select * from Estados'

            db.transaction(tx => {
                tx.executeSql(query, [], (_, { rows }) => resolve(rows), (_, error) => { return reject(error) })
            })
        })
    }
}
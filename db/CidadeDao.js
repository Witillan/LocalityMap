import { Platform } from 'react-native'
import Sqlite from './Sqlite'

export default class CidadesDao {
    static Insert (values) {
        return new Promise((resolve, reject) => {
          const db = Sqlite.getDb()
    
          db.transaction(tx => {
            values.forEach(item => {
              tx.executeSql('insert or replace into Cidades values (?,?,?,?)', [item.id, item.microrregiao.mesorregiao.UF.id, item.microrregiao.mesorregiao.UF.regiao.id, item.nome])
            })
          }, reject, resolve)
        })
      }

    static GetCidades() {
        return new Promise((resolve, reject) => {
            const db = Sqlite.getDb()

            const query = 'select * from Cidades'

            db.transaction(tx => {
                tx.executeSql(query, [], (_, { rows }) => resolve(rows), (_, error) => { return reject(error) })
            })
        })
    }
}
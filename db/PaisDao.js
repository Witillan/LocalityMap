import { Platform } from 'react-native'
import Sqlite from './Sqlite'

export default class PaisDao {
    static Insert(values) {
        return new Promise((resolve, reject) => {
            const db = Sqlite.getDb()

            db.transaction(tx => {
                values.forEach(item => {
                    tx.executeSql('insert or replace into Pais values (?,?,?)', [item.id.M49, item.id["ISO-3166-1-ALPHA-2"], item.nome.abreviado])
                })
            }, reject, resolve)
        })
    }

    static GetPais() {
        return new Promise((resolve, reject) => {
            const db = Sqlite.getDb()

            const query = 'select * from Pais'

            db.transaction(tx => {
                tx.executeSql(query, [], (_, { rows }) => resolve(rows), (_, error) => { return reject(error) })
            })
        })
    }
}
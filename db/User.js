import Sqlite from './Sqlite'

export default class UserDao {

    static Insert(value) {
        return new Promise((resolve, reject) => {
            debugger
            const db = Sqlite.getDb()

            db.transaction(tx => {
                const parameters = [
                    value.id,
                    value.nome,
                ]
                tx.executeSql(`insert or replace into User values (${parameters.map(() => '?').join(',')})`, parameters)
            }, reject, resolve)
        })
    }

    static GetUser() {
        return new Promise((resolve, reject) => {
            const db = Sqlite.getDb()

            const query = 'select * from User'

            db.transaction(tx => {
                tx.executeSql(query, [], (_, { rows }) => resolve(rows), (_, error) => { return reject(error) })
            })
        })
    }
}
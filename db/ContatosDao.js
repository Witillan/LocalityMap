import Sqlite from './Sqlite'

export default class ContatosDao {

    static Insert(value) {
        return new Promise((resolve, reject) => {
            debugger
            const db = Sqlite.getDb()

            db.transaction(tx => {
                const parameters = [
                    value.id,
                    value.nome,
                    value.telefone,
                ]
                tx.executeSql(`insert or replace into Contatos values (${parameters.map(() => '?').join(',')})`, parameters)
            }, reject, resolve)
        })
    }

    static GetEmail(email) {
        return new Promise((resolve, reject) => {
            const db = Sqlite.getDb()

            const query = `select * from Contatos where email = ${email}`

            db.transaction(tx => {
                tx.executeSql(query, [], (_, { rows }) => resolve(rows), (_, error) => { return reject(error) })
            })
        })
    }

    static GetContatos() {
        return new Promise((resolve, reject) => {
            const db = Sqlite.getDb()

            const query = 'select * from Contatos'

            db.transaction(tx => {
                tx.executeSql(query, [], (_, { rows }) => resolve(rows), (_, error) => { return reject(error) })
            })
        })
    }
}
import { Platform } from 'react-native'
import Sqlite from './Sqlite'

export default class QuizzesDao {

    static Insert(value) {
        return new Promise((resolve, reject) => {
            debugger
            const db = Sqlite.getDb()

            db.transaction(tx => {
                const parameters = [
                    value.id,
                    value.numQuizz,
                    value.nome,
                    value.descricao
                ]
                tx.executeSql(`insert or replace into Quizz values (${parameters.map(() => '?').join(',')})`, parameters)
            }, reject, resolve)
        })
    }

    static GetQuizzes() {
        return new Promise((resolve, reject) => {
            const db = Sqlite.getDb()

            const query = 'select * from Quizz'

            db.transaction(tx => {
                tx.executeSql(query, [], (_, { rows }) => resolve(() => {
                    if (Platform.OS === 'android') {
                        return rows._array
                    } else {
                        return rows
                    }
                }), (_, error) => { return reject(error) })
            })
        })
    }
}
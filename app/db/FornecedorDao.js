import AsyncStorage from '@react-native-async-storage/async-storage'

import Sqlite from './Sqlite'

export const TipoPessoa = {
  PessoaFisica: 1,
  PessoaJuridica: 2
}
export default class FornecedorDAO {
  static AddOrReplaceFromAPI (values) {
    return new Promise((resolve, reject) => {
      const db = Sqlite.getDb()

      db.transaction(tx => {
        values.forEach(item => {
          const parameters = [
            item.tempId || item.id,
            item.id,
            item.idAlphaExpress,
            item.nomeRazao,
            item.apelido,
            item.tipoPessoa,
            item.cpf,
            item.rg,
            item.codigoIbgeCidade,
            item.endereco,
            item.numero,
            item.bairro,
            item.cep,
            item.complemento,
            item.telefone,
            item.celular,
            item.contato,
            item.observacao,
            item.idAparelho,
            item.inativo,
            item.bloqueado,
            item.sincronizado,
            item.empresaId,
            item.vendedores,
            item.dataCriacao,
            item.dataAlteracao,
            item.aviso
          ]
          tx.executeSql(`insert or replace into Fornecedor values (${parameters.map(() => '?').join(',')})`, parameters)
        })
      }, reject, resolve)
    })
  }

  static Insert (value) {
    return new Promise((resolve, reject) => {
      const db = Sqlite.getDb()

      db.transaction(tx => {
        const parameters = [
          value.tempId || value.id,
          value.id,
          value.idAlphaExpress,
          value.nomeRazao,
          value.apelido,
          value.tipoPessoa,
          value.cpf,
          value.rg,
          value.codigoIbgeCidade,
          value.endereco,
          value.numero,
          value.bairro,
          value.cep,
          value.complemento,
          value.telefone,
          value.celular,
          value.contato,
          value.observacao,
          value.idAparelho,
          value.inativo,
          value.bloqueado,
          value.sincronizado,
          value.empresaId,
          value.vendedores,
          value.dataCriacao,
          value.dataAlteracao,
          value.aviso
        ]
        tx.executeSql(`insert or replace into Fornecedor values (${parameters.map(() => '?').join(',')})`, parameters)
      }, reject, resolve)
    })
  }

  static GetListAll () {
    return new Promise((resolve, reject) => {
      AsyncStorage.multiGet(['Empresa', 'UserInfo']).then(([empresaStr, userInfoStr]) => {
        const db = Sqlite.getDb()

        const empresa = JSON.parse(empresaStr[1])
        const user = JSON.parse(userInfoStr[1])

        const query = `select * from Fornecedor where empresaId = '${empresa.id}'`

        db.transaction(tx => {
          tx.executeSql(query, [], (_, { rows }) => {
            let fornecedores = rows._array

            fornecedores = fornecedores.filter(q => !q.vendedores ? true : q.vendedores.split(',').some(q => q === user.idAlphaExpress.toString()))

            return resolve(fornecedores)
          }, (_, error) => { return reject(error) })
        })
      })
    })
  }

  static GetFornecedorWithTempId (tempId) {
    return new Promise((resolve, reject) => {
      AsyncStorage.getItem('Empresa').then((empresaStr) => {
        const db = Sqlite.getDb()

        const empresa = JSON.parse(empresaStr)

        const query = `select * from Fornecedor where empresaId = '${empresa.id}' and tempId = '${tempId}'`

        db.transaction(tx => {
          tx.executeSql(query, [], (_, { rows }) => resolve(rows._array.length ? rows._array[0] : null), (_, error) => { return reject(error) })
        })
      })
    })
  }

  static Filter (busca, offset = 0) {
    return new Promise((resolve, reject) => {
      AsyncStorage.getItem('Empresa').then((empresaStr) => {
        const db = Sqlite.getDb()

        const empresa = JSON.parse(empresaStr)

        let query = `
        select
          c.id,
          c.nomeRazao,
          c.apelido,
          c.idAlphaExpress,
          c.cpf,
          c.endereco,
          c.numero,
          c.codigoIbgeCidade,
          ci.codigoIbge,
          ci.nome as nomeCidade,
          ci.uf,
          c.aviso
        from Fornecedor c
        inner join Cidade ci on ci.codigoIbge = c.codigoIbgeCidade
        where c.empresaId = '${empresa.id}' and c.id is not null and (c.nomeRazao like '%${busca}%' or c.apelido like '%${busca}%' or c.idAlphaExpress like '%${busca}%' or c.cpf like '%${busca}%')`

        query += ' order by c.nomeRazao'

        query += ' limit 10'
        query += ' offset ?'

        db.transaction(tx => {
          tx.executeSql(query, [offset], (_, { rows }) => resolve(rows._array), (_, error) => { return reject(error) })
        })
      })
    })
  }

  static FilterFornecedor (nomeFornecedor, cpf, offset = 0) {
    return new Promise((resolve, reject) => {
      AsyncStorage.multiGet(['Empresa', 'UserInfo']).then(([empresaStr, userInfoStr]) => {
        const db = Sqlite.getDb()

        const empresa = JSON.parse(empresaStr[1])
        const user = JSON.parse(userInfoStr[1])

        let query = `
        SELECT
          c.apelido,
          c.nomeRazao,
          c.vendedores,
          c.cpf,
          c.celular,
          c.telefone,
          c.numero,
          c.endereco,
          c.bloqueado,
          c.inativo,
          c.id,
          c.tempId,
          c.codigoIbgeCidade,
          ci.codigoIbge,
          ci.nome as nomeCidade,
          ci.uf,
          c.aviso
        FROM Fornecedor c
        LEFT OUTER JOIN Cidade ci ON ci.codigoIbge = c.codigoIbgeCidade
        `
        const clauses = [`c.empresaId = '${empresa.id}'`]

        if (nomeFornecedor) {
          clauses.push(`(c.apelido like '%${nomeFornecedor}%' or c.nomeRazao like '%${nomeFornecedor}%')`)
        }

        if (cpf) {
          clauses.push(`c.cpf like '%${cpf}%'`)
        }

        if (clauses.length) {
          query += ` where ${clauses.join(' and ')}`
        }

        query += ' order by c.nomeRazao ASC, c.apelido ASC'

        query += ' limit 10'
        query += ' offset ?'

        db.transaction(tx => {
          tx.executeSql(query, [offset], (_, { rows }) => {
            let fornecedores = rows._array

            fornecedores = fornecedores.filter(q => !q.vendedores ? true : q.vendedores.split(',').some(p => p === user.idAlphaExpress.toString()))

            return resolve(fornecedores)
          }, (_, error) => { return reject(error) })
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
          tx.executeSql(`delete from Fornecedor where empresaId = '${empresa.id}' and Id in (${values.map(item => `'${item}'`).join(',')})`)
        }, reject, resolve)
      })
    })
  }

  static RemoveByTempId (values) {
    return new Promise((resolve, reject) => {
      AsyncStorage.getItem('Empresa').then((empresaStr) => {
        const db = Sqlite.getDb()

        const empresa = JSON.parse(empresaStr)

        db.transaction(tx => {
          tx.executeSql(`delete from Fornecedor where empresaId = '${empresa.id}' and tempId in (${values.map(item => `'${item}'`).join(',')})`)
        }, reject, resolve)
      }).catch(err => reject(err))
    })
  }

  static RemoveAll () {
    return new Promise((resolve, reject) => {
      AsyncStorage.getItem('Empresa').then((empresaStr) => {
        const db = Sqlite.getDb()

        const empresa = JSON.parse(empresaStr)

        db.transaction(tx => {
          tx.executeSql(`delete from Fornecedor where empresaId = '${empresa.id}'`)
        }, reject, resolve)
      })
    })
  }

  static Delete () {
    return new Promise((resolve, reject) => {
      const db = Sqlite.getDb()

      db.transaction(tx => {
        tx.executeSql('delete from Fornecedor')
      }, reject, resolve)
    })
  }

  static GetListComparacaoAlteracoes () {
    return new Promise((resolve, reject) => {
      AsyncStorage.getItem('Empresa').then((empresaStr) => {
        const db = Sqlite.getDb()

        const empresa = JSON.parse(empresaStr)

        const query = `select id, dataCriacao, dataAlteracao from Fornecedor where empresaId = '${empresa.id}' and id is not null`

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

        const query = `select id from Fornecedor where empresaId = '${empresa.id}' and id is not null`

        db.transaction(tx => {
          tx.executeSql(query, [], (_, { rows }) => resolve(rows._array.map(item => item.id)), (_, error) => { return reject(error) })
        })
      })
    })
  }

  static GetListAdicionadosEAlterados () {
    return new Promise((resolve, reject) => {
      AsyncStorage.getItem('Empresa').then((empresaStr) => {
        const db = Sqlite.getDb()

        const empresa = JSON.parse(empresaStr)

        const query = `select * from Fornecedor where empresaId = '${empresa.id}' and idAparelho is not null`

        db.transaction(tx => {
          tx.executeSql(query, [], (_, { rows }) => resolve(rows._array), (_, error) => { return reject(error) })
        })
      })
    })
  }

  // static GetListToFilter(filtro, select, offset) {
  //   return new Promise((resolve, reject) => {
  //     const db = Sqlite.getDb();
  //     let query = `select ${select ? select.join(",") : "*"} from Fornecedor`;
  //     let clausesAnd = [];
  //     let clausesAndText = "";
  //     let clausesOr = [];
  //     let clausesOrText = "";

  //     if (filtro) {
  //       if (clausesAnd.length || clausesOr.length) {
  //         query += " where ";
  //       }

  //       let clausesGeneral = [];

  //       if (clausesAnd.length) {
  //         clausesAndText = `(${clausesAnd.join(" and ")})`;
  //         clausesGeneral.push(clausesAndText);
  //       }

  //       if (clausesOr.length) {
  //         clausesOrText = `(${clausesOr.join(" or ")})`;
  //         clausesGeneral.push(clausesOrText);
  //       }
  //       query += clausesGeneral.join(" and ");
  //     }

  //     query += ` limit 10`;

  //     if (offset) {
  //       query += ` offset ${offset}`;
  //     }

  //     db.transaction((tx) => {
  //       tx.executeSql(
  //         query,
  //         [],
  //         (_, res) => resolve(res.rows._array),
  //         (_, error) => {
  //           return reject(error);
  //         }
  //       );
  //     });
  //   });
  // }
}

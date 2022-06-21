import * as SQLite from 'expo-sqlite'

export default class Sqlite {
  static getDb() {
    return SQLite.openDatabase('LocalityMap')
  }

  static runDDL() {
    const db = this.getDb()

    // Executando transaction da DDL do banco
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(`create table if not exists Pais (
        id int primary key not null,
        sigla text,
        nome text
      )`)

      }, reject, resolve)
      db.transaction(tx => {
        tx.executeSql(`create table if not exists Estados (
        id int primary key not null,
        idRegiao int,
        idPais,
        sigla text,
        nome text,
        foreign key (idPais) references Pais (id) on delete cascade on update no action
      )`)
      }, reject, resolve)

      db.transaction(tx => {
        tx.executeSql(`create table if not exists Cidades (
        id int primary key not null,
        idEstado int,
        idRegiao int,
        nome text,
        foreign key (idEstado) references Pais (id) on delete cascade on update no action
      )`)
      }, reject, resolve)

      db.transaction(tx => {
        tx.executeSql(`create table if not exists User (
        id int primary key not null,
        nome text
      )`)
      }, reject, resolve)

      db.transaction(tx => {
        tx.executeSql(`create table if not exists Quizz (
          id int primary key not null,
          numQuizz int,
          nome text,
          descricao text
          )`)
      }, reject, resolve)
    })
  }

  // Adicionar novas colunas nas tabelas
  static addNewColumns() {
    const db = this.getDb()

    // Executando transaction da DDL do banco
    return new Promise((resolve) => {
      db.exec([
        {
          sql: '',
          args: []
        }
      ], false, resolve)
      resolve()
    })
  }
}

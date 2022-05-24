import AsyncStorage from '@react-native-async-storage/async-storage'
import { useFocusEffect } from '@react-navigation/native'
import * as BackgroundFetch from 'expo-background-fetch'
import { LineChart, PieChart } from 'expo-chart-kit'
import * as TaskManager from 'expo-task-manager'
import moment from 'moment'
import React, { useCallback, useMemo, useState } from 'react'
import { Dimensions, ScrollView, StyleSheet, useColorScheme, View } from 'react-native'
import { sincronizacaoGeral } from '../../api'
import { LabelPrimary, LabelRequired, SafeAreaView1, useDefaultStyleSheet } from '../../components/style'
import PedidoDAO from '../../db/PedidoDao'
import { checkConnection } from '../../hooks/useNetworkStatus'
import { getPeriodValues } from '../../util/date'
import { NumberUtil } from '../../util/number'

BackgroundFetch.setMinimumIntervalAsync(5)

const SINCRONIZACAO_TASK_NAME = 'sincronizacao-geral'

TaskManager.defineTask(SINCRONIZACAO_TASK_NAME, async () => {
  const authorization = await AsyncStorage.getItem('Authorization')

  if ((await checkConnection()) && authorization) {
    await sincronizacaoGeral({ sincronizarCidades: false })
    return BackgroundFetch.Result.NewData
  }

  return BackgroundFetch.Result.NoData
})

const DashboardScreen = () => {
  const { defaultStyle } = useDefaultStyleSheet()
  const scheme = useColorScheme()
  const dark = scheme === 'dark'

  const screenWidth = (Dimensions.get('window').width) - 20

  const [totalDate, setTotalDate] = useState([])

  // Controladores da data do mês de Janeiro
  const dateInicioJan = useMemo(() => moment(new Date()).month(0).startOf('month').format('YYYY-MM-DDTHH:mm:ss'), [])
  const dateFimJan = useMemo(() => moment(new Date()).month(0).endOf('month').format('YYYY-MM-DDTHH:mm:ss'), [])

  // Controladores da data do mês de Fevereiro
  const dateInicioFev = useMemo(() => moment(new Date()).month(1).startOf('month').format('YYYY-MM-DDTHH:mm:ss'), [])
  const dateFimFev = useMemo(() => moment(new Date()).month(1).endOf('month').format('YYYY-MM-DDTHH:mm:ss'), [])

  // Controladores da data do mês de Março
  const dateInicioMar = useMemo(() => moment(new Date()).month(2).startOf('month').format('YYYY-MM-DDTHH:mm:ss'), [])
  const dateFimMar = useMemo(() => moment(new Date()).month(2).endOf('month').format('YYYY-MM-DDTHH:mm:ss'), [])

  // Controladores da data do mês de Abriu
  const dateInicioAbr = useMemo(() => moment(new Date()).month(3).startOf('month').format('YYYY-MM-DDTHH:mm:ss'), [])
  const dateFimAbr = useMemo(() => moment(new Date()).month(3).endOf('month').format('YYYY-MM-DDTHH:mm:ss'), [])

  // Controladores da data do mês de Maio
  const dateInicioMai = useMemo(() => moment(new Date()).month(4).startOf('month').format('YYYY-MM-DDTHH:mm:ss'), [])
  const dateFimMai = useMemo(() => moment(new Date()).month(4).endOf('month').format('YYYY-MM-DDTHH:mm:ss'), [])

  // Controladores da data do mês de Junho
  const dateInicioJun = useMemo(() => moment(new Date()).month(5).startOf('month').format('YYYY-MM-DDTHH:mm:ss'), [])
  const dateFimJun = useMemo(() => moment(new Date()).month(5).endOf('month').format('YYYY-MM-DDTHH:mm:ss'), [])

  // Controladores da data do mês de Julho
  const dateInicioJul = useMemo(() => moment(new Date()).month(6).startOf('month').format('YYYY-MM-DDTHH:mm:ss'), [])
  const dateFimJul = useMemo(() => moment(new Date()).month(6).endOf('month').format('YYYY-MM-DDTHH:mm:ss'), [])

  // Controladores da data do mês de Agosto
  const dateInicioAgo = useMemo(() => moment(new Date()).month(7).startOf('month').format('YYYY-MM-DDTHH:mm:ss'), [])
  const dateFimAgo = useMemo(() => moment(new Date()).month(7).endOf('month').format('YYYY-MM-DDTHH:mm:ss'), [])

  // Controladores da data do mês de Setembro
  const dateInicioSet = useMemo(() => moment(new Date()).month(8).startOf('month').format('YYYY-MM-DDTHH:mm:ss'), [])
  const dateFimSet = useMemo(() => moment(new Date()).month(8).endOf('month').format('YYYY-MM-DDTHH:mm:ss'), [])

  // Controladores da data do mês de Outubro
  const dateInicioOut = useMemo(() => moment(new Date()).month(9).startOf('month').format('YYYY-MM-DDTHH:mm:ss'), [])
  const dateFimOut = useMemo(() => moment(new Date()).month(9).endOf('month').format('YYYY-MM-DDTHH:mm:ss'), [])

  // Controladores da data do mês de Novembro
  const dateInicioNov = useMemo(() => moment(new Date()).month(10).startOf('month').format('YYYY-MM-DDTHH:mm:ss'), [])
  const dateFimNov = useMemo(() => moment(new Date()).month(10).endOf('month').format('YYYY-MM-DDTHH:mm:ss'), [])

  // Controladores da data do mês de Dezembro
  const dateInicioDez = useMemo(() => moment(new Date()).month(11).startOf('month').format('YYYY-MM-DDTHH:mm:ss'), [])
  const dateFimDez = useMemo(() => moment(new Date()).month(11).endOf('month').format('YYYY-MM-DDTHH:mm:ss'), [])

  // Controladores do dia atual
  const dateInicioDia = useMemo(() => moment(new Date()).startOf('day').format('YYYY-MM-DDTHH:mm:ss'), [])
  const dateFimDia = useMemo(() => moment(new Date()).endOf('day').format('YYYY-MM-DDTHH:mm:ss'), [])

  // Controladores da semana atual
  const dateInicioSem = useMemo(() => moment(getPeriodValues(0)[0]).format('YYYY-MM-DDTHH:mm:ss'), [])
  const dateFimSem = useMemo(() => moment(getPeriodValues(0)[1]).format('YYYY-MM-DDTHH:mm:ss'), [])

  const initBackgroundFetch = async () => {
    const registered = await TaskManager.isTaskRegisteredAsync(SINCRONIZACAO_TASK_NAME)

    const backgroundFetchStatus = await BackgroundFetch.getStatusAsync()
    switch (backgroundFetchStatus) {
      case BackgroundFetch.BackgroundFetchStatus.Restricted:
        return

      case BackgroundFetch.BackgroundFetchStatus.Denied:
        return

      default:
        if (!registered) {
          await BackgroundFetch.registerTaskAsync(SINCRONIZACAO_TASK_NAME, {
            minimumInterval: 15,
            startOnBoot: true,
            stopOnTerminate: false
          })
        }
        break
    }
  }

  useFocusEffect(useCallback(() => {
    initBackgroundFetch()

    const filtros = ({
      dateInicioJan,
      dateFimJan,
      dateInicioFev,
      dateFimFev,
      dateInicioMar,
      dateFimMar,
      dateInicioAbr,
      dateFimAbr,
      dateInicioMai,
      dateFimMai,
      dateInicioJun,
      dateFimJun,
      dateInicioJul,
      dateFimJul,
      dateInicioAgo,
      dateFimAgo,
      dateInicioSet,
      dateFimSet,
      dateInicioOut,
      dateFimOut,
      dateInicioNov,
      dateFimNov,
      dateInicioDez,
      dateFimDez,
      dateInicioSem,
      dateFimSem,
      dateInicioDia,
      dateFimDia
    })

    PedidoDAO.PedidosDashboard({ filtros }).then(setTotalDate)
  }, [dateFimAbr, dateFimAgo, dateFimDez, dateFimDia, dateFimFev, dateFimJan, dateFimJul, dateFimJun, dateFimMai, dateFimMar, dateFimNov, dateFimOut, dateFimSem, dateFimSet, dateInicioAbr, dateInicioAgo, dateInicioDez, dateInicioDia, dateInicioFev, dateInicioJan, dateInicioJul, dateInicioJun, dateInicioMai, dateInicioMar, dateInicioNov, dateInicioOut, dateInicioSem, dateInicioSet]))

  const getTotal = useCallback((list) => {
    if (list === undefined) {
      return 0
    } else {
      return list?.map(q => q.total).reduce((prev, curr) => prev + curr, 0)
    }
  }, [])

  const listBarChart1 = useMemo(() => {
    const lista = []
    lista.push(getTotal(totalDate[0]))
    lista.push(getTotal(totalDate[1]))
    lista.push(getTotal(totalDate[2]))
    lista.push(getTotal(totalDate[3]))
    lista.push(getTotal(totalDate[4]))
    lista.push(getTotal(totalDate[5]))
    return lista
  }, [getTotal, totalDate])

  const listBarChart2 = useMemo(() => {
    const lista = []
    lista.push(getTotal(totalDate[6]))
    lista.push(getTotal(totalDate[7]))
    lista.push(getTotal(totalDate[8]))
    lista.push(getTotal(totalDate[9]))
    lista.push(getTotal(totalDate[10]))
    lista.push(getTotal(totalDate[11]))

    return lista
  }, [getTotal, totalDate])

  const dataBarChart1 = useMemo(() => ({
    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
    datasets: [{
      data: listBarChart1
    }]
  }), [listBarChart1])

  const dataBarChart2 = useMemo(() => ({
    labels: ['Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
    datasets: [{
      data: listBarChart2,
      colors: [
        (opacity = 1) => `rgb(17, 141, 255, ${opacity})`,
        (opacity = 1) => `rgb(17, 141, 255, ${opacity})`
      ]
    }]
  }), [listBarChart2])

  const dataPieChart1 = useMemo(() => [
    { name: 'Jan', population: (getTotal(totalDate[0]) || 0), color: 'red', legendFontColor: '#7F7F7F', legendFontSize: 15 },
    { name: 'Fev', population: (getTotal(totalDate[1]) || 0), color: 'yellow', legendFontColor: '#7F7F7F', legendFontSize: 15 },
    { name: 'Mar', population: (getTotal(totalDate[2]) || 0), color: 'green', legendFontColor: '#7F7F7F', legendFontSize: 15 },
    { name: 'Abr', population: (getTotal(totalDate[3]) || 0), color: 'purple', legendFontColor: '#7F7F7F', legendFontSize: 15 },
    { name: 'Mai', population: (getTotal(totalDate[4]) || 0), color: '#FF977E', legendFontColor: '#7F7F7F', legendFontSize: 15 },
    { name: 'Jun', population: (getTotal(totalDate[5]) || 0), color: '#EB5757', legendFontColor: '#7F7F7F', legendFontSize: 15 }
  ], [getTotal, totalDate])

  const dataPieChart2 = useMemo(() => [
    { name: 'Jul', population: (getTotal(totalDate[6]) || 0), color: '#5ECBC8', legendFontColor: '#7F7F7F', legendFontSize: 15 },
    { name: 'Ago', population: (getTotal(totalDate[7]) || 0), color: '#8250C4', legendFontColor: '#7F7F7F', legendFontSize: 15 },
    { name: 'Set', population: (getTotal(totalDate[8]) || 0), color: '#118DFF', legendFontColor: '#7F7F7F', legendFontSize: 15 },
    { name: 'Out', population: (getTotal(totalDate[9]) || 0), color: '#15C6F4', legendFontColor: '#7F7F7F', legendFontSize: 15 },
    { name: 'Nov', population: (getTotal(totalDate[10]) || 0), color: '#FD5DA9', legendFontColor: '#7F7F7F', legendFontSize: 15 },
    { name: 'Dez', population: (getTotal(totalDate[11]) || 0), color: '#5BD667', legendFontColor: '#7F7F7F', legendFontSize: 15 }
  ], [getTotal, totalDate])

  const chartConfig = useMemo(() => ({
    backgroundGradientFrom: defaultStyle.background1.backgroundColor,
    backgroundGradientTo: defaultStyle.background1.backgroundColor,
    color: () => dark ? '#118DFF' : '#118DFF',
    barPercentage: 0.3,
    decimalPlaces: 0
  }), [dark, defaultStyle.background1.backgroundColor])

  const getSumTotal = useCallback((grafico) => {
    if (grafico === 1) {
      return totalDate?.map((q, index) => {
        if (index <= 5) {
          return q?.map(q => q.total).reduce((prev, curr) => prev + curr, 0)
        } else {
          return 0
        }
      }).reduce((prev, curr) => prev + curr, 0)
    } else if (grafico === 2) {
      return totalDate?.map((q, index) => {
        if (index >= 6 && index <= 11) {
          return q?.map(q => q.total).reduce((prev, curr) => prev + curr, 0)
        } else {
          return 0
        }
      }).reduce((prev, curr) => prev + curr, 0)
    } else {
      return totalDate?.map(q => q.map(qi => qi.total)).reduce((prev, curr) => prev + curr, 0).reduce((prev, curr) => prev + curr, 0)
    }
  }, [totalDate])

  return (
    <SafeAreaView1>
      <ScrollView>
        <View style={{ padding: 5, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
          <View style={{ marginTop: 10, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}>
            <View style={[styles.viewCards, { backgroundColor: dark ? '#118DFF' : '#006EBE', width: (screenWidth - 35) }]}>
              <View>
                <LabelPrimary style={styles.cardTitle}>TOTAL DIA</LabelPrimary>
              </View>
              <View>
                <LabelPrimary style={styles.cardValue}>{`${NumberUtil.toDisplayNumber(getTotal(totalDate[12]), 'R$', true)}`}</LabelPrimary>
              </View>
            </View>
          </View>
          <View style={{ marginTop: 10, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}>
            <View style={[styles.viewCards, { backgroundColor: dark ? '#118DFF' : '#006EBE', width: (screenWidth - 35) }]}>
              <View>
                <LabelPrimary style={styles.cardTitle}>TOTAL SEM</LabelPrimary>
              </View>
              <View>
                <LabelPrimary style={styles.cardValue}>{`${NumberUtil.toDisplayNumber(getTotal(totalDate[13]), 'R$', true)}`}</LabelPrimary>
              </View>
            </View>
          </View>
          <View style={{ marginTop: 10, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}>
            <View style={[styles.viewCards, { backgroundColor: dark ? '#118DFF' : '#006EBE', width: ((screenWidth / 2) - 23) }]}>
              <View>
                <LabelPrimary style={styles.cardTitle}>JAN</LabelPrimary>
              </View>
              <View>
                <LabelPrimary style={styles.cardValue}>{`${NumberUtil.toDisplayNumber(getTotal(totalDate[0]), 'R$', true)}`}</LabelPrimary>
              </View>
            </View>
            <View style={[styles.viewCards, { backgroundColor: dark ? '#118DFF' : '#006EBE', width: ((screenWidth / 2) - 23), marginLeft: 10 }]}>
              <View>
                <LabelPrimary style={styles.cardTitle}>FEV</LabelPrimary>
              </View>
              <View>
                <LabelPrimary style={styles.cardValue}>{`${NumberUtil.toDisplayNumber(getTotal(totalDate[1]), 'R$', true)}`}</LabelPrimary>
              </View>
            </View>
          </View>
          <View style={{ marginTop: 10, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}>
            <View style={[styles.viewCards, { backgroundColor: dark ? '#118DFF' : '#006EBE', width: ((screenWidth / 2) - 23) }]}>
              <View>
                <LabelPrimary style={styles.cardTitle}>MAR</LabelPrimary>
              </View>
              <View>
                <LabelPrimary style={styles.cardValue}>{`${NumberUtil.toDisplayNumber(getTotal(totalDate[2]), 'R$', true)}`}</LabelPrimary>
              </View>
            </View>
            <View style={[styles.viewCards, { backgroundColor: dark ? '#118DFF' : '#006EBE', width: ((screenWidth / 2) - 23), marginLeft: 10 }]}>
              <View>
                <LabelPrimary style={styles.cardTitle}>ABR</LabelPrimary>
              </View>
              <View>
                <LabelPrimary style={styles.cardValue}>{`${NumberUtil.toDisplayNumber(getTotal(totalDate[3]), 'R$', true)}`}</LabelPrimary>
              </View>
            </View>
          </View>
          <View style={{ marginTop: 10, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}>
            <View style={[styles.viewCards, { backgroundColor: dark ? '#118DFF' : '#006EBE', width: ((screenWidth / 2) - 23) }]}>
              <View>
                <LabelPrimary style={styles.cardTitle}>MAI</LabelPrimary>
              </View>
              <View>
                <LabelPrimary style={styles.cardValue}>{`${NumberUtil.toDisplayNumber(getTotal(totalDate[4]), 'R$', true)}`}</LabelPrimary>
              </View>
            </View>
            <View style={[styles.viewCards, { backgroundColor: dark ? '#118DFF' : '#006EBE', width: ((screenWidth / 2) - 23), marginLeft: 10 }]}>
              <View>
                <LabelPrimary style={styles.cardTitle}>JUN</LabelPrimary>
              </View>
              <View>
                <LabelPrimary style={styles.cardValue}>{`${NumberUtil.toDisplayNumber(getTotal(totalDate[5]), 'R$', true)}`}</LabelPrimary>
              </View>
            </View>
          </View>
          <View style={{ marginTop: 10, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}>
            <View style={[styles.viewCards, { backgroundColor: dark ? '#118DFF' : '#006EBE', width: ((screenWidth / 2) - 23) }]}>
              <View>
                <LabelPrimary style={styles.cardTitle}>JUL</LabelPrimary>
              </View>
              <View>
                <LabelPrimary style={styles.cardValue}>{`${NumberUtil.toDisplayNumber(getTotal(totalDate[6]), 'R$', true)}`}</LabelPrimary>
              </View>
            </View>
            <View style={[styles.viewCards, { backgroundColor: dark ? '#118DFF' : '#006EBE', width: ((screenWidth / 2) - 23), marginLeft: 10 }]}>
              <View>
                <LabelPrimary style={styles.cardTitle}>AGO</LabelPrimary>
              </View>
              <View>
                <LabelPrimary style={styles.cardValue}>{`${NumberUtil.toDisplayNumber(getTotal(totalDate[7]), 'R$', true)}`}</LabelPrimary>
              </View>
            </View>
          </View>
          <View style={{ marginTop: 10, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}>
            <View style={[styles.viewCards, { backgroundColor: dark ? '#118DFF' : '#006EBE', width: ((screenWidth / 2) - 23) }]}>
              <View>
                <LabelPrimary style={styles.cardTitle}>SET</LabelPrimary>
              </View>
              <View>
                <LabelPrimary style={styles.cardValue}>{`${NumberUtil.toDisplayNumber(getTotal(totalDate[8]), 'R$', true)}`}</LabelPrimary>
              </View>
            </View>
            <View style={[styles.viewCards, { backgroundColor: dark ? '#118DFF' : '#006EBE', width: ((screenWidth / 2) - 23), marginLeft: 10 }]}>
              <View>
                <LabelPrimary style={styles.cardTitle}>OUT</LabelPrimary>
              </View>
              <View>
                <LabelPrimary style={styles.cardValue}>{`${NumberUtil.toDisplayNumber(getTotal(totalDate[9]), 'R$', true)}`}</LabelPrimary>
              </View>
            </View>
          </View>
          <View style={{ marginTop: 10, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}>
            <View style={[styles.viewCards, { backgroundColor: dark ? '#118DFF' : '#006EBE', width: ((screenWidth / 2) - 23), marginRight: 10 }]}>
              <View>
                <LabelPrimary style={styles.cardTitle}>NOV</LabelPrimary>
              </View>
              <View>
                <LabelPrimary style={styles.cardValue}>{`${NumberUtil.toDisplayNumber(getTotal(totalDate[10]), 'R$', true)}`}</LabelPrimary>
              </View>
            </View>
            <View style={[styles.viewCards, { backgroundColor: dark ? '#118DFF' : '#006EBE', width: ((screenWidth / 2) - 23) }]}>
              <View>
                <LabelPrimary style={styles.cardTitle}>DEZ</LabelPrimary>
              </View>
              <View>
                <LabelPrimary style={styles.cardValue}>{`${NumberUtil.toDisplayNumber(getTotal(totalDate[11]), 'R$', true)}`}</LabelPrimary>
              </View>
            </View>
          </View>
        </View>
        <View style={{ paddingTop: 10, padding: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <LabelPrimary style={styles.title}>Vendas no 1° Semestre</LabelPrimary>
          <LineChart
            data={dataBarChart1}
            width={screenWidth}
            height={250}
            chartConfig={chartConfig}
            style={{ color: 'red', fontSize: 30 }}
          />
        </View>
        <View style={{ paddingTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <LabelPrimary style={styles.title}>Vendas no 2° Semestre</LabelPrimary>
          <LineChart
            data={dataBarChart2}
            width={screenWidth}
            height={250}
            chartConfig={chartConfig}
            withInnerLines={false}
          />
        </View>
        {getSumTotal(1) > 0 ? <View style={{ paddingTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <LabelPrimary style={styles.title}>Comparativo do 1° Semestre</LabelPrimary>
          <PieChart
            data={dataPieChart1}
            width={screenWidth}
            height={250}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
          />
        </View>
          : <View style={{ paddingTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LabelPrimary style={styles.title}>Comparativo do 1° Semestre</LabelPrimary>
            <LabelRequired style={styles.title}>Este gráfico não possui valores</LabelRequired>
          </View>
        }
        {getSumTotal(2) > 0 ? <View style={{ paddingTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <LabelPrimary style={styles.title}>Comparativo do 2° Semestre</LabelPrimary>
          <PieChart
            data={dataPieChart2}
            width={screenWidth}
            height={250}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
          />
        </View>
          : <View style={{ paddingTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
            <LabelPrimary style={styles.title}>Comparativo do 2° Semestre</LabelPrimary>
            <LabelRequired style={styles.title}>Este gráfico não possui valores</LabelRequired>
          </View>
        }
      </ScrollView>
    </SafeAreaView1>
  )
}

const styles = StyleSheet.create({
  textDateImportCard: {
    padding: 5,
    borderBottomWidth: 2,
    borderBottomColor: '#0A7AC3'
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  viewCards: {
    borderRadius: 5,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
    paddingVertical: 8
  },
  justify: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold'
  },
  cardValue: {
    color: '#FFFFFF',
    fontSize: 23,
    fontWeight: 'bold'
  },
  title: {
    fontSize: 17,
    fontWeight: 'bold',
    padding: 5
  }
})

export default DashboardScreen

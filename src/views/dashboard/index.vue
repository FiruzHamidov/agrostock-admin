<template>
  <div class="dashboard-container">
    <div class="stats">
      <div class="line-charts">
        <el-row v-if="lineChart">
          <vue-element-loading :active="isLoading" spinner="bar-fade-scale" />
          <p class="center-text text-style">Динамика товаров, торгов и сделок</p>
          <line-chart :chart-data="lineChart" />
        </el-row>
      </div>
      
      <div class="line-charts" v-if="profitLineChart">
        <el-row>
          <vue-element-loading :active="isLoading" spinner="bar-fade-scale" />
          <p class="center-text text-style">Динамика прибыли</p>
          <line-chart :chart-data="transformToProfitLineChart()" />
        </el-row>
      </div>

      <div class="common" v-if="pieChart">
        <div class="pie" v-if="pieChart.dealsStatuses">
          <p class="center-text text-style">Разбиение сделок по статусам</p>
          <p class="text-style sum-text">
            Количество сделок - {{ countSum(pieChart.dealsStatuses) }}
          </p>
          <pie-chart :chart-data="transformToPieChart(pieChart.dealsStatuses)" />
        </div>
        <div class="pie" v-if="pieChart.productsReports">
          <p class="center-text text-style">Разбиение сделок по типу</p>
          <p class="text-style sum-text">Количество сделок - {{ countSum(pieChart.productsReports) }}</p>
          <pie-chart :chart-data="transformToPieChart(pieChart.productsReports)" />
        </div>
        <div class="pie" v-if="pieChart.tendersReports">
          <p class="center-text text-style">Разбиение тендеров по типу</p>
          <p class="text-style sum-text">
            Количество тендеров - {{ countSum(pieChart.tendersReports) }}
          </p>
          <pie-chart :chart-data="transformToPieChart(pieChart.tendersReports)" />
        </div>
        <div class="pie" v-if="pieChart.tendersStatuses">
          <p class="center-text text-style">Разбиение тендеров по типу статусам</p>
          <p class="text-style sum-text">Количество тендеров - {{ countSum(pieChart.tendersStatuses) }}</p>
          <pie-chart :chart-data="transformToPieChart(pieChart.tendersStatuses)" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import StarRating from 'vue-star-rating'
import VueElementLoading from 'vue-element-loading'
import { mapGetters, mapActions } from 'vuex'
import moment from 'moment'

import ExcelExport from '@/components/ExcelExport'
import AsyncSelect from '@/components/AsyncSelect'

import LineChart from './components/LineChart'
import PieChart from './components/PieChart'

export default {
  name: 'Dashboard',

  components: {
    StarRating,
    VueElementLoading,
    ExcelExport,
    LineChart,
    PieChart,
    AsyncSelect,
  },

  data() {
    return {
      lineChart: null,
      profitLineChart: null,
      pieChart: {},
      isLoading: true,
    }
  },
  
  mounted() {
    this.fetchData()
  },

  methods: {
    async fetchData() {
      this.isLoading = true

      const query = {}

      const res = await this.$apiClient.service('stats/line').find({
        query,
      })
      this.lineChart = res

      const profitRes = await this.$apiClient.service('stats/line-transactions').find({
        query,
      })
      this.profitLineChart = profitRes.replenishment

      this.pieChart = await this.$apiClient.service('stats/pie').find({
        query,
      })

      this.isLoading = false
    },

    handleChangeCompany(companyId) {
      const val = companyId === '' ? undefined : companyId
      this.setCompanyId(val)
      this.fetchData()
    },

    transformToProfitLineChart() {
      return {
        dates: this.profitLineChart.map(e => e.date),
        quantities: {
          company: {
            name: 'Прибыль',
            data: this.profitLineChart.map(e => e.sum),
          },
        },
      }
    },

    transformToPieChart(arr = []) {
      const chartValues = {}
      const seriesArr = []
      const legendArr = []

      if (arr.length === 0) {
        chartValues.x = {
          name: 'Нет данных',
          total: 0,
        }
        seriesArr.push({ value: 0, name: 'Нет данных' })
        legendArr.push('Нет данных')
        return { seriesArr, legendArr }
      }

      arr.forEach(e => {
        legendArr.push(e.status || e.type)
        seriesArr.push({
          value: e.value,
          name: e.status || e.type,
        })
      })

      return { seriesArr, legendArr }
    },

    countSum(arr) {
      return arr.reduce((acc, e) => (acc += +e.value), 0)
    },

    countDaysInMonth(selectedRange) {
      const currentDate = moment(selectedRange[0], 'DD-MM-YYYY')
      const endDate = selectedRange[1] !== '' ? moment(selectedRange[1]) : moment()

      const dates = {}
      dates[currentDate.format('DD-MM-YYYY')] = 0
      while (currentDate.add(1, 'days').diff(endDate) <= 0) {
        dates[currentDate.format('DD-MM-YYYY')] = 0
      }

      return dates
    },

    countHours() {
      const hours = {}
      for (let i = 1; i < 25; i++) {
        hours[i] = 0
      }
      return hours
    },

    getCompanyName() {
      return 'Сеть'
    },
  },
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.top-menu {
  margin-bottom: 30px;
}

.dashboard {
  &-container {
    margin: 30px;
  }
  &-text {
    font-size: 30px;
    line-height: 46px;
  }
}

.common,
.point-info {
  display: flex;
  flex-wrap: wrap;
  padding-left: 3%;
}
.pie {
  width: 30%;
  margin-right: 3%;
  display: flex;
  flex-direction: column;
}
.point-stats {
  margin-top: 30px;
}
.star-rating {
  align-self: center;
}

.sum-text {
  text-align: center;
  margin-top: 0px;
}
.center-text {
  text-align: center;
  margin-top: 40px;
}
.average-check {
  margin-top: 0px;
}

.text-style {
  color: rgba(0, 0, 0, 0.45);
  font-size: 16px;
  font-weight: bold;
}

.margin-left {
  margin-left: 15px;
}
</style>

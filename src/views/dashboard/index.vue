<template>
  <div class="dashboard-container">
    <div class="stats">
      <el-alert
        v-if="loadError"
        :closable="false"
        :title="loadError"
        class="dashboard-alert"
        type="error"
        show-icon
      />
      <div class="line-charts">
        <el-row v-if="lineChart">
          <vue-element-loading :active="isLoading" spinner="bar-fade-scale" />
          <p class="center-text text-style">Динамика товаров, торгов и сделок</p>
          <line-chart-by-arrays :chart-data="lineChart" />
        </el-row>
        <el-empty v-else-if="!isLoading" description="Нет данных по динамике" />
      </div>
      
      <div v-if="profitLineChart" class="line-charts">
        <el-row>
          <vue-element-loading :active="isLoading" spinner="bar-fade-scale" />
          <p class="center-text text-style">Динамика прибыли</p>
          <line-chart :chart-data="transformToProfitLineChart()" />
        </el-row>
      </div>

      <div v-if="pieChart" class="common">
        <div v-if="pieChart.dealsStatuses && dealStatuses" class="pie">
          <p class="center-text text-style">Разбиение сделок по статусам</p>
          <p class="text-style sum-text">
            Количество сделок - {{ countSum(pieChart.dealsStatuses) }}
          </p>
          <pie-chart :chart-data="transformToPieChart(getPieChartsLabel(pieChart.dealsStatuses, dealStatuses, 'status'))" />
        </div>
        <div v-if="pieChart.productsReports" class="pie">
          <p class="center-text text-style">Разбиение сделок по типу</p>
          <p class="text-style sum-text">Количество сделок - {{ countSum(pieChart.productsReports) }}</p>
          <pie-chart :chart-data="transformToPieChart(getPieChartsLabel(pieChart.productsReports, productsReports, 'type'))" />
        </div>
        <div v-if="pieChart.tendersReports" class="pie">
          <p class="center-text text-style">Разбиение тендеров по типу</p>
          <p class="text-style sum-text">
            Количество тендеров - {{ countSum(pieChart.tendersReports) }}
          </p>
          <pie-chart :chart-data="transformToPieChart(getPieChartsLabel(pieChart.tendersReports, tenderReports, 'type'))" />
        </div>
        <div v-if="pieChart.tendersStatuses && tenderStatuses" class="pie">
          <p class="center-text text-style">Разбиение тендеров по типу статусам</p>
          <p class="text-style sum-text">Количество тендеров - {{ countSum(pieChart.tendersStatuses) }}</p>
          <pie-chart :chart-data="transformToPieChart(getPieChartsLabel(pieChart.tendersStatuses, tenderStatuses, 'status'))" />
        </div>
      </div>
      <el-empty v-if="!isLoading && !pieChart && !loadError" description="Нет данных для графиков" />
    </div>
  </div>
</template>

<script>
import StarRating from 'vue-star-rating'
import VueElementLoading from 'vue-element-loading'

import ExcelExport from '@/components/ExcelExport'
import AsyncSelect from '@/components/AsyncSelect'

import LineChartByArrays from './components/LineChartByArrays'
import LineChart from './components/LineChart'
import PieChart from './components/PieChart'

import { tenderStatuses, tenderReports, dealStatuses, productsReports } from '@/utils/variables'
import { handleApiError } from '@/utils/api-error'

export default {
  name: 'Dashboard',

  components: {
    StarRating,
    VueElementLoading,
    ExcelExport,
    LineChartByArrays,
    LineChart,
    PieChart,
    AsyncSelect,
  },

  data() {
    return {
      lineChart: {
        deals: [100, 120, 161, 134, 105, 160, 165],
        products: [120, 82, 91, 154, 162, 140, 145],
        tenders: [120, 70, 10, 154, 162, 10, 130]
      },
      profitLineChart: null,
      pieChart: null,
      isLoading: true,
      loadError: '',
      tenderStatuses,
      tenderReports,
      dealStatuses,
      productsReports,
    }
  },
  
  mounted() {
    this.fetchData()
  },

  methods: {
    async fetchData() {
      this.isLoading = true
      this.loadError = ''

      const query = {}

      try {
        const res = await this.$apiClient.service('stats/line').find({ query })

        this.lineChart = res

        const profitRes = await this.$apiClient.service('stats/line-transactions').find({ query })
        this.profitLineChart = profitRes.replenishment || []

        this.pieChart = await this.$apiClient.service('stats/pie').find({ query })
      } catch (err) {
        const parsed = handleApiError(this, err, 'Не удалось загрузить статистику')
        this.loadError = parsed.message
        this.lineChart = null
        this.profitLineChart = null
        this.pieChart = null
      }

      this.isLoading = false
    },

    handleChangeCompany(companyId) {
      const val = companyId === '' ? undefined : companyId
      this.setCompanyId(val)
      this.fetchData()
    },

    transformToProfitLineChart() {
      const profitLineChart = this.profitLineChart || []
      return {
        dates: profitLineChart.map(e => e.date),
        quantities: {
          company: {
            name: 'Прибыль',
            data: profitLineChart.map(e => e.sum),
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
    
    getPieChartsLabel(arr, translateArr, field) {
      const newArr = [...arr]
      newArr.forEach((e, index) => {
        const translated = translateArr.find(item => item.value === e[field])
        if(translated){
          newArr[index].status = translated.label
        }
      })
      return newArr
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

.dashboard-alert {
  margin-bottom: 16px;
}
</style>

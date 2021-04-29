<template>
  <div
    :class="className" 
    :style="{height:height,width:width}"/>
</template>

<script>
import echarts from 'echarts'
import { debounce } from '@/utils'

export default {
  props: {
    className: {
      type: String,
      default: 'chart'
    },
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '250px'
    },
    chartData: {
      type: Object,
      default: () => ({})
    }
  },

  data() {
    return {
      chart: null,
      chartValues: {}
    }
  },

  watch: {
    chartData: {
      handler() {
        this.initChart()
      },
      deep: true
    }
  },

  mounted() {
    this.initChart()
    this.__resizeHandler = debounce(() => {
      if (this.chart) {
        this.chart.resize()
      }
    }, 100)
    window.addEventListener('resize', this.__resizeHandler)
  },

  beforeDestroy() {
    if (!this.chart) {
      return
    }
    window.removeEventListener('resize', this.__resizeHandler)
    this.chart.dispose()
    this.chart = null
  },
  
  methods: {
    initChart() {
      this.chart = echarts.init(this.$el, 'macarons')
      
      this.setOptions(this.chartData)
    },

    setOptions({ seriesArr, legendArr }) {
      this.chart.setOption({
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b} : {c} ({d}%)'
        },
        legend: {
          left: 'center',
          bottom: '10',
          data: legendArr
        },
        calculable: true,
        series: [
          {
            name: '',
            type: 'pie',
            radius: [10, 60],
            center: ['50%', '38%'],
            data: seriesArr,
            animationEasing: 'cubicInOut',
            animationDuration: 2600
          }
        ]
      })
    }
  }
}
</script>

<template>
  <div>
    <span class="text-style">Диапозон дат для выгрузки: </span>
    <el-date-picker
      v-model="date.from"
      type="date"
      placeholder="Pick a day" />
    <el-date-picker
      v-model="date.to"
      type="date"
      placeholder="Pick a day" />
    <el-button
      :loading="isLoading"
      style="margin:0 0 20px 20px;"
      type="primary"
      icon="document"
      @click="handleDownload" >
      Export Excel
    </el-button>
  </div>
</template>

<script>
import moment from 'moment'

export default {
  name: 'ExcelExport',

  data() {
    return {
      date: {
        from: new Date(),
        to: new Date()
      },
      commission: 0,
      orders: [],
      isLoading: false,
      translates: {
        card: 'Картой',
        cash: 'Наличными',
        car: 'К машине',
        leg: 'Самовызов',
        canceled: 'Отклонён',
        done: 'Исполнен',
        new: 'Новый заказ',
        accepted: 'Принят',
        ready: 'Готов',
        wrong_order: 'Несоответствие заказа или стоимости',
        quality: 'Качество продуктов',
        time: 'Время приготовления',
        service: 'Обслуживание',
        other: 'Другое',
        ml: 'мл.',
        li: 'л.',
        gr: 'гр.',
        mg: 'мг.',
        po: 'порция'
      }
    }
  },

  methods: {
    async handleDownload() {
      this.isLoading = true

      await this.fetchOrders()
      await this.fetchCommission()
      
      import('@/vendor/Export2Excel').then(excel => {
        const outputFormat = {
          '№': 'orderNum',
          'Дата создания заказа': 'createdAt',
          'Дата завершения заказа': 'takeTime',
          'Статус заказа': 'status',
          '_id точки, в которой был совершен заказ': 'pointId',
          'Название точки, в которой был совершен заказ': 'point.name',
          'Клиент': 'client.name',
          'Телефон клиента': 'client.phone',
          'Сумма заказа': 'orderAmount',
          'Сумма с учётом комиссии за процессинг': 'orderAmountCommission',
          'Способ оплаты': 'paymentType',
          'Тип доставки': 'deliveryType',
          'Состав заказа': 'products',
          'Оценка заказа': 'ratings'
        }
        const list = this.orders
        const data = this.formatJson(Object.values(outputFormat), list)
        excel.export_json_to_excel({
          header: Object.keys(outputFormat),
          data
        })
        this.isLoading = false
      })

    },

    async fetchOrders() {
      const ordersService = this.$apiClient.service('orders')

      const query = {
        companyId: this.activeCompanyId,
        createdAt: {
          $gte: this.date.from,
          $lte: moment(this.date.to).add(1, 'days').format('YYYY-MM-DD')
        },
        $limit: -1
      }

      this.orders = await ordersService.find({ query })
    },

    async fetchCommission() {
      this.commission = (await this.$apiClient.service('settings').find({ query: { $select: ['commission'] } })).commission
    },

    formatJson(filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => {
        if (j.indexOf('.') > -1) {
          const val = j.split('.').reduce((obj, path) => {
            if (!obj) {
              return false
            }
            return obj[path]
          }, v)
          if (!val) {
            return 'Неизвестно'
          }
          return val
        }
        if (j === 'orderAmountCommission') {
          if (v.paymentType === 'card') {
            return v.orderAmount / 100 * (100 - this.commission)
          }
          return v.orderAmount
        }
        if (j === 'createdAt' || j === 'updatedAt' || j === 'takeTime') {
          return moment(v[j]).format('YYYY-MM-DD H:m')
        }
        if (j === 'products') {
          return v[j].map(productInfo => {
            const volume = productInfo.product.volume.find(volume => volume._id && productInfo.volumeId && volume._id.toString() === productInfo.volumeId.toString())
            return `${productInfo.product.name} - ${productInfo.quantity} шт. ${volume.count * productInfo.quantity} ${this.translates[volume.volumeType] ? this.translates[volume.volumeType] : volume.volumeType}`
          })
        }
        if (j === 'ratings') {
          return v[j].length === 0 ?
            'Неизвестно' :
            v[j].map(rating => `${this.translates[rating.type] ? this.translates[rating.type] : rating.type} - ${rating.rating}`)
        }
        if (j === 'deliveryType' && v[j] === 'car') {
          if (v.client && v.client.cars && v.client.cars[0]) {
            return `К машине: ${v.client.cars[0].brand} ${v.client.cars[0].plateNumber} (${v.client.cars[0].color})`
          } else {
            return 'К машине'
          }
        }
        
        return this.translates[v[j]] ? this.translates[v[j]] : v[j]
      }))
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.text-style {
  color: rgba(0, 0, 0, 0.45);
  font-size: 16px;
  font-weight: bold;
}
</style>
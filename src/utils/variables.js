// https://rastamozhitvspb.ru/spravka/vidy-upakovki/
export const packagingTypes = [
  'Барабан',
  'Контейнер',
  'Бочка',
  'Канистра',
  'Мешок',
  'Коробка',
  'Комбинированная упаковка',
  'Ящик',
  'Сосуд',
  'Аэрозольная упаковка',
  'Поддон',
  'Грейферный ковш',
  'Кулек',
  'Шар',
  'Ампула',
  'Капсула',
  'Бобина',
  'Баллон',
  'Пачка',
  'Бункер',
  'Бадья',
  'Корзина',
  'Кипа',
  'Чан',
  'Рулон',
  'Бидон',
  'Кофр',
  'Сундук',
  'Бухта',
  'Кассета',
  'Чаша',
  'Чехол',
  'Клеть',
  'Банка',
  'Цилиндр',
  'Шина',
  'Связка',
  'Цистерна',
  'Бак',
]

export const batchUnitSizes = [
  { value: 'kg', label: 'кг' },
  { value: 't', label: 'тонн' },
  { value: 'q', label: 'центнер' },
  { value: 'st', label: 'Стоун' },
  { value: 'lb', label: 'Фунт' },
  { value: 'oz', label: 'Унция' },
  { value: 'dr', label: 'Драм' },
]

export const taxTypes = [
  { label: 'НДС 10', value: 'VAT10' },
  { label: 'НДС 20', value: 'VAT20' },
  { label: 'Не облагается', value: 'no' },
]

export const currencies = [
  { label: 'Рубль', value: 'rub' },
  { label: 'Доллар', value: 'usd' },
  { label: 'Евро', value: 'euro' },
]

export const tenderStatuses = [
  { value: 'wait', text: 'Идут', desc: '' },
  { value: 'active', text: 'Приостановлены', desc: '' },
  { value: 'suspended', text: 'Ожидают запуска', desc: '' },
  { value: 'doneWithWinner', text: 'Завершены', desc: 'Есть победитель' },
  { value: 'doneWithoutWinner', text: 'Не завершены', desc: 'Нет победителя' },
  // {value: 'banned', text: '', desc: ''},
]

export const currencySymbols = {
  rub: '₽',
  usd: '$',
  euro: '€',
}

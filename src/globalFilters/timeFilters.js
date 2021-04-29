import moment from 'moment'

export const toDateFormat = (val) => {
  if (!moment(val).isValid()) {
    return val
  }
  return moment(val).format('YYYY-MM-DD HH:mm:ss')
}
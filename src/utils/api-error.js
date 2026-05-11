export function extractRequestId(error) {
  const headers = (error && error.response && error.response.headers) || {}
  return (
    headers['x-request-id'] ||
    headers['request-id'] ||
    headers['x-correlation-id'] ||
    (error && error.data && error.data.requestId) ||
    null
  )
}

export function getErrorMessage(error, fallback) {
  const details = (error && error.errors) || (error && error.data && error.data.errors) || null
  const firstDetail = details && typeof details === 'object' ? details[Object.keys(details)[0]] : null

  return (
    firstDetail ||
    (error && error.message) ||
    (error && error.data && error.data.message) ||
    (error && error.response && error.response.data && error.response.data.message) ||
    fallback ||
    'Ошибка запроса'
  )
}

export function handleApiError(vm, error, fallback) {
  const requestId = extractRequestId(error)
  const message = getErrorMessage(error, fallback)
  const requestText = requestId ? ` (requestId: ${requestId})` : ''

  if (vm && vm.$message) {
    vm.$message({
      type: 'error',
      message: `${message}${requestText}`,
      duration: 6000,
    })
  }

  return {
    message,
    requestId,
    code: error && error.code,
    raw: error,
  }
}

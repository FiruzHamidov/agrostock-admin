'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  // BASE_API: '"http://localhost:3030"',
  // FILE_URL: '"http://localhost:3030"',
  BASE_API: '"https://api.agrostock.online"',
  FILE_URL: '"https://api.agrostock.online"',
  SOCKET_PATH: '"/socket.io"',
})

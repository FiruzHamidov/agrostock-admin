import feathers from '@feathersjs/feathers'
import socketio from '@feathersjs/socketio-client'
import io from 'socket.io-client'
import auth from '@feathersjs/authentication-client'

export const host = process.env.BASE_API || 'http://localhost:3030'

const socket = io(host, {
  transports: ['polling'],
  path: process.env.SOCKET_PATH || '/socket.io'
})

const feathersClient = feathers()
  .configure(socketio(socket))
  .configure(auth({ storage: window.localStorage }))

export default feathersClient

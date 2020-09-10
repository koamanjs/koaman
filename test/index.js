const path = require('path')
const Koa = require('../index')
const app = new Koa()

app
  .cors(['yy.com'])
  .upload({ root: __dirname, logs: path.resolve(__dirname, 'logs') })
  .logger()
  .errorHandler()
  .util()
  .redis(require('./config.redis'))
  .udp([{ name: 'test', port: 8011 }])
  .udpServer(8011)
  .controller('controller.*')
  .model()
  .service()
  .router()
  .extend('util.js')

;(async () => {
  await app.interceptor('interceptor.js')
  app.start()
})()

module.exports = app

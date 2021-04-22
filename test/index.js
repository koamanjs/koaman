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
  .udpServe([{ name: 'test', port: 8011 }])
  .udpService(8011)
  .controller('controller.*')
  .model()
  .service()
  .router()
  .io()
  .extend('util.js')

;(async () => {
  await app.interceptor('interceptor.js')
  app.start()
})()

module.exports = app

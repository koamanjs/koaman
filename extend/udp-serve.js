const Koa = require('koa')

Koa.prototype.udpServe = function (optConfig) {
  const serves = (() => {
    if (typeof optConfig === 'undefined' && process.env.UDP_SERVE) return JSON.parse(process.env.UDP_SERVE)
    if (typeof optConfig === 'string') return JSON.parse(optConfig)
    return optConfig
  })()

  const udpClient = require('dgram').createSocket('udp4')
  const callback = {}
  const error = {}
  const timer = {}
  const timeout = 10 * 1000

  udpClient.on('message', async msg => {
    const msgJson = JSON.parse(msg.toString())
    const uuid = msgJson.uuid

    if (msgJson.type !== 'response') { return }

    delete msgJson.uuid
    delete msgJson.type

    // 清除超时定时器
    clearTimeout(timer[uuid])
    delete timer[uuid]

    if (msgJson.error && error[uuid]) {
      await error[uuid](msgJson.error)
    } else if (callback[uuid]) {
      await callback[uuid](msgJson.data)
    }

    delete callback[uuid]
    delete error[uuid]
  })

  this.context.udp = new Proxy({}, {
    get: (target, key) => data => new Promise((resolve, reject) => {
      const uuid = require('../common/uuid')()
      callback[uuid] = resolve
      error[uuid] = reject

      let host, port
      if (Array.isArray(serves)) {
        // 多机
        const namespace = key.split('/')[0]
        serves.forEach(item => {
          if (item.name === namespace) {
            host = item.host || '127.0.0.1'
            port = item.port
            key = key.replace(namespace, '')
          }
        })
      } else {
        // 单机
        if (serves.name) {
          const namespace = key.split('/')[0]
          key = key.replace(namespace, '')
        }
        host = serves.host || '127.0.0.1'
        port = serves.port
      }

      if (port) {
        // 发送请求
        udpClient.send(
          Buffer.from(JSON.stringify(Object.assign({ data }, { action: key }, { uuid }, { type: 'request' }))),
          port,
          host
        )

        // 超时定时器
        timer[uuid] = setTimeout(() => {
          // 抛出错误
          error[uuid]('timeout')

          // 清理回调
          clearTimeout(timer[uuid])
          delete timer[uuid]
          delete callback[uuid]
          delete error[uuid]
        }, timeout)
      } else {
        console.error(`[KoaMan] udp send (${key}) not found`)
      }
    })
  })

  this.context.udpClientServes = serves

  return this
}

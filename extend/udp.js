const Koa = require('koa')

Koa.prototype.udp = function (serves) {
  const udpClient = require('dgram').createSocket('udp4')
  const callback = {}
  const error = {}

  udpClient.on('message', async msg => {
    const msgJson = JSON.parse(msg.toString())
    const uuid = msgJson.uuid

    if (msgJson.type !== 'response') { return }

    delete msgJson.uuid
    delete msgJson.type

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
        udpClient.send(
          Buffer.from(JSON.stringify(Object.assign({ data }, { action: key }, { uuid }, { type: 'request' }))),
          port,
          host
        )
      } else {
        console.error(`[KoaMan] udp send (${key}) not found`)
      }
    })
  })

  this.context.udpClientServes = serves

  return this
}

const Koa = require('koa')

Koa.prototype.redis = function (optConfig) {
  const { config, name } = (() => {
    if (typeof optConfig === 'undefined' && process.env.REDIS) return JSON.parse(process.env.REDIS)
    if (typeof optConfig === 'string') return JSON.parse(optConfig)
    return optConfig
  })()

  const Redis = require('ioredis')

  if (!config && !name) {
    return this
  }

  this.context.redis = (() => {
    // sentinels
    if (Array.isArray(config) && name) {
      return new Redis({
        sentinels: config,
        name
      })
    }
    // 直连
    return new Redis(config)
  })()

  return this
}

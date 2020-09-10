const Koa = require('koa')

Koa.prototype.redis = function ({ config, name }) {
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

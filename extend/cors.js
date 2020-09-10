const Koa = require('koa')

Koa.prototype.cors = function (options = {}) {
  const cors = require('@koa/cors')

  this.use(cors({
    origin: options.origin || '*',
    maxAge: options.maxAge || 7,
    credentials: options.credentials || true,
    allowMethods: options.allowMethods || 'GET,HEAD,PUT,POST,DELETE,PATCH',
    allowHeaders: options.allowHeaders,
    exposeHeaders: options.exposeHeaders
  }))

  return this
}

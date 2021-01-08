const Koa = require('koa')
class KMError extends Error {}

Koa.prototype.errorHandler = function () {
  this.context.error = (code, message) => {
    const DEFAULT_ERROR_STAUTS_CODE = 406
    if (code && typeof code === 'string' && !message) {
      message = code
      code = DEFAULT_ERROR_STAUTS_CODE
    }
    const error = new KMError()
    error.code = code || DEFAULT_ERROR_STAUTS_CODE
    error.message = message || 'KMError'
    return error
  }

  this.use((ctx, next) => {
    return next().catch(error => {
      // 捕获已知抛出错误
      if (error instanceof KMError) {
        ctx.throw(error.code, error.message)
      }

      // 未知错误
      ctx.logger && ctx.logger.error('[Handler]', error.stack)

      ctx.throw(error.code || 500)
    })
  })

  return this
}

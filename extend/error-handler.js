const Koa = require('koa')
class KmError extends Error {}

Koa.prototype.errorHandler = function () {
  this.context.error = (code, message) => {
    const DEFAULT_ERROR_STAUTS_CODE = 406
    if (code && typeof code === 'string' && !message) {
      message = code
      code = DEFAULT_ERROR_STAUTS_CODE
    }
    const error = new KmError()
    error.code = code || DEFAULT_ERROR_STAUTS_CODE
    error.message = message || 'KmError'
    return error
  }

  this.use((ctx, next) => {
    return next().catch(error => {
      // 捕获已知抛出错误
      if (error instanceof KmError) {
        ctx.throw(error.code, error.message)
      }

      // 未知错误
      ctx.logger && ctx.logger.error('[Handler]', error.stack)

      ctx.throw(error.code || 500)
    })
  })

  return this
}

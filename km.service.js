/**
 * 服务模块
 */

const Koa = require('koa')
const resolveFiles = require('./common/resolve-files')

Koa.prototype.service = function (filesName = 'km.service.*') {
  const service = {}
  const files = resolveFiles(filesName)

  for (const file of files) {
    const ServiceClass = require(file)

    // service class
    if (ServiceClass.toString().indexOf('class') === 0) {
      const ServiceEntity = new ServiceClass()
      ServiceEntity.ctx = this.context
      service[ServiceClass.name] = ServiceEntity
    } else if (ServiceClass.name && typeof ServiceClass === 'function') {
      // service function
      ServiceClass.ctx = this.context
      service[ServiceClass.name] = ServiceClass
    }
  }

  this.context.service = service

  return this
}

/**
 * 控制器
 */

const Koa = require('koa')
const resolveFiles = require('./common/resolve-files')

Koa.prototype.controller = function (filesName = 'km.controller.*') {
  const controller = {}
  const files = resolveFiles(filesName)

  for (const file of files) {
    const ControllerClass = require(file)
    // controller class
    if (ControllerClass.toString().indexOf('class') === 0) {
      controller[ControllerClass.name] = new ControllerClass()
    } else if (ControllerClass.name && typeof ControllerClass === 'function') {
      // controller function
      controller[ControllerClass.name] = ControllerClass
    }
  }

  this.context.controller = controller

  return this
}

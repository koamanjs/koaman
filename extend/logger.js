const path = require('path')
const fs = require('fs')
const Koa = require('koa')

Koa.prototype.logger = function (logsPath = 'logs') {
  const log4js = require('log4js')
  const rootDir = process.cwd()

  logsPath = path.isAbsolute(logsPath) ? logsPath : path.resolve(rootDir, logsPath)

  !fs.existsSync(logsPath) && fs.mkdirSync(logsPath)

  const options = {
    appenders: {
      default: { type: 'console' },
      file: {
        type: 'dateFile',
        filename: path.resolve(logsPath, 'km'),
        pattern: '.yyyy-MM-dd.log',
        alwaysIncludePattern: true
      }
    },
    categories: {
      default: { appenders: ['default', 'file'], level: 'all' }
    }
  }

  if (process.env.PM2_CLUSTER) {
    options.pm2 = true
    options.pm2InstanceVar = 'INSTANCE_ID'
  }

  log4js.configure(options)

  const processLogger = log4js.getLogger('[PROCESS]')

  this.context.logger = log4js.getLogger('[KM]')

  process.on('uncaughtException', error => processLogger.error(error))
  process.on('unhandledRejection', (reason, p) => processLogger.error(reason, p))

  return this
}

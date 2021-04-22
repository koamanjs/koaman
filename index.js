require('./extend/pm2env')
require('./extend/logger')
require('./extend/cors')
require('./extend/upload')
require('./extend/redis')
require('./extend/error-handler')
require('./extend/udp-serve')

const chalk = require('chalk')
const Koa = require('koa')
const resolveFiles = require('./common/resolve-files')

require('./km.controller')
require('./km.model')
require('./km.service')

/**
 * udp server
 */
let udpServicePort
let udpServiceHost
Koa.prototype.udpService = function (port = process.env.UDP_PORT, host) {
  udpServicePort = port
  udpServiceHost = host
  return this
}

/**
 * 路由
 */
let routerMap = []
const udpRouterMap = []
Koa.prototype.router = function (filesName = 'km.router.*') {
  const files = resolveFiles(filesName)
  const Router = require('koa-router')
  const koaBody = require('koa-body')
  const router = new Router()

  router.udp = (...args) => {
    const action = args.shift()
    const handlers = args
    udpRouterMap.push({ action, handlers })
  }

  for (const file of files) {
    require(file)({ router, ...this.context })
  }

  routerMap = JSON.parse(JSON.stringify(router.stack))
  udpRouterMap.forEach(item => routerMap.push({ path: item.action, methods: 'UDP' }))

  this.use(koaBody({
    includeUnparsed: true,
    parsedMethods: [
      'GET', 'HEAD', 'DELETE', 'POST', 'PUT', 'PATCH'
    ]
  }))
  this.use(router.routes())
  this.use(router.allowedMethods())

  return this
}

/**
 * 扩展
 */
Koa.prototype.extend = function (filesName = 'km.extend.*') {
  const files = resolveFiles(filesName)

  for (const file of files) {
    require(file)(this.context)
  }

  return this
}

/**
 * 拦截器
 */
Koa.prototype.interceptor = async function (filesName = 'km.interceptor.*') {
  const files = resolveFiles(filesName)

  for (const file of files) {
    await require(file)(this)
  }
}

/**
 * 工具类
 */
Koa.prototype.util = function (filesName = 'km.util.*') {
  const files = resolveFiles(filesName)

  this.context.util = {}

  for (const file of files) {
    this.context.util = Object.assign(this.context.util, require(file))
  }

  return this
}

/**
 * socket.io
 */
let io = false
Koa.prototype.io = function () {
  io = true
  return this
}

/**
 * 启动实例
 */
Koa.prototype.start = function (port = process.env.PORT, callback) {
  if (!port) {
    console.log(chalk.red('⚠️ Port undefined\n'))
    process.exit()
  }

  // 启动 app
  const server = require('http').createServer(this.callback())

  if (io) {
    const { Server } = require('socket.io')
    this.context.io = new Server(server, {
      transports: ['websocket']
    })
  }

  server.listen(port, callback)

  // udp 服务监听处理
  if (udpServicePort) {
    const udpServer = require('dgram').createSocket('udp4')

    udpServer.on('message', async (message, remote) => {
      const msgJson = (() => {
        try {
          return JSON.parse(message)
        } catch (error) {
          return {}
        }
      })()

      if (msgJson.type !== 'request') { return }

      // 成功回传
      const callbackSender = (data = null) => {
        const msg = Buffer.from(JSON.stringify({
          type: 'response', uuid: msgJson.uuid, error: null, data
        }))

        const Threshold = 5000
        const Count = msg.length
        const HFlag = '-#kmut#S#-'
        const EFlag = '-#kmut#E#-'
        // 数据报过大，分切回传
        if (Count > Threshold) {
          const msgHeader = `times-${new Date().getTime()}${HFlag}`
          for (let i = 0; i < Math.ceil(Count / Threshold); i++) {
            const start = Threshold * i
            const end = start + Threshold - 1
            let content, newMsg
            if (end >= Count) {
              content = msg.toString('utf8', start, Count)
              newMsg = msgHeader + content + EFlag
            } else {
              content = msg.toString('utf8', start, end)
              newMsg = msgHeader + content
            }
            const msgBuf = Buffer.from(newMsg)
            udpServer.send(msgBuf, 0, msgBuf.length, remote.port, remote.address)
          }
        } else {
          udpServer.send(msg, 0, msg.length, remote.port, remote.address, error => console.error(error))
        }
      }

      // 错误回传
      const errorSender = (error = 'error') => {
        const msg = Buffer.from(JSON.stringify({
          type: 'response', uuid: msgJson.uuid, error, data: null
        }))
        udpServer.send(msg, 0, msg.length, remote.port, remote.address)
      }

      // 请求参数
      const params = msgJson.data
      const action = msgJson.action

      // 处理器
      const [actionhandlers] = udpRouterMap.filter(item => {
        if (item.action === action) {
          return true
        }
      })

      if (!actionhandlers || (actionhandlers && actionhandlers.handlers.length === 0)) {
        callbackSender('handlers undefined')
        return
      }

      for (const handler of actionhandlers.handlers) {
        await handler({ ...this.context, udpParams: params, udpSend: callbackSender, udpError: errorSender })
      }
    })

    udpServer.bind(udpServicePort, udpServiceHost)
  }

  // 非 PM2 启动打印输出信息
  if (!process.env.KOAMAN_PM2) {
    const packageJson = require('./package.json')

    console.log()
    console.log(chalk.green.bold(` 🤖KoaMan v${packageJson.version}`))
    console.log()

    console.log(chalk.blue.bold(' HttpServe'))
    console.log(`   port: ${port}`)
    console.log(`   host: ${chalk.underline(`http://${require('./common/get-ip')()}:${port}`)}`)
    console.log()

    if (udpServicePort || this.context.udpClientServes) {
      console.log(chalk.blue.bold(' UdpServe'))

      // 自身 udp 服务
      if (udpServicePort) {
        console.log(chalk.yellowBright(`   ${udpServiceHost || 'self'} (${udpServicePort})`))
      }

      // 其他 udp 服务连接
      const udpClientServes = this.context.udpClientServes
      if (udpClientServes) {
        let udpClientServesArray = udpClientServes
        if (!Array.isArray(udpClientServesArray)) {
          udpClientServesArray = [udpClientServesArray]
        }
        udpClientServesArray.forEach(serve => {
          console.log(`   ${serve.name || serve.ip || 'local'} (${serve.port})`)
        })
      }

      console.log()
    }

    console.log(chalk.magenta.bold(' Env'))
    Object.keys(process.env).forEach(env => {
      if (env.indexOf('NODE_ENV') >= 0 || env.indexOf('KM_') === 0) {
        console.log(`   ${env}: ${process.env[env]}`)
      }
    })
    console.log()

    if (process.env.DB) {
      console.log(chalk.magenta.bold(' DB'))
      let DBConfig = JSON.parse(process.env.DB)
      !Array.isArray(DBConfig) && (DBConfig = [DBConfig])
      DBConfig.forEach(item => {
        console.log(`   ${item.name ? item.name : 'defalut'} (${item.host})`)
      })
      console.log()
    }

    if (routerMap.length > 0) {
      console.log(chalk.cyan.bold(' Router'))
      routerMap.forEach(item => console.log(`   ${item.path} (${item.methods})`))
      console.log()
    }
  }
  console.log('\n')

  if (io) {
    for (const file of resolveFiles('km.io.*')) {
      require(file)(this.context)
    }
  }

  return server
}

module.exports = Koa

const path = require('path')
const fs = require('fs')
// 指定启动的 PM2 环境
const NODE_ENV = process.env.NODE_ENV
// 指定启动的 PM2 应用名
const KM_PM2_NAME = process.env.KM_PM2_NAME
const rootDir = process.cwd()
const pm2config = path.resolve(rootDir, 'config.pm2.js')

module.exports = function () {
  let config

  if (NODE_ENV && fs.existsSync(pm2config)) {
    const { apps } = require(pm2config)

    for (const app of apps) {
      const { name, env } = app

      if (!config && env && env.NODE_ENV === NODE_ENV && !KM_PM2_NAME) {
        config = app
      }

      if (!config && env && env.NODE_ENV === NODE_ENV && KM_PM2_NAME && KM_PM2_NAME === name) {
        config = app
      }
    }
  }

  return config
}

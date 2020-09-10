// 检查发布 km 版本
require('../common/check-version')

const fs = require('fs')
const path = require('path')
const execa = require('execa')
const config = require('../common/get-pm2-env-config')()
const packageJson = require('../package.json')
const NODE_ENV = process.env.NODE_ENV
const projectDir = process.cwd()

// PM2 启动标识
process.env.KOAMAN_PM2 = 'KOAMAN_PM2'

if (config) {
  const configFileName = 'ecosystem.config.js'
  fs.copyFileSync(path.resolve(projectDir, 'config.pm2.js'), path.resolve(projectDir, configFileName))

  const { name } = config
  console.log(`[KoaMan Version] v${packageJson.version}\n`)
  console.log(`[KoaMan PM2] name: ${name}, env: ${NODE_ENV}\n`)
  execa.command(`pm2 start ${configFileName} --only ${name}`, { stdio: 'inherit' })
} else {
  console.log('[KoaMan PM2] config undefined')
}

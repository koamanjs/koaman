const chalk = require('chalk')
const config = require('../common/get-pm2-env-config')()

if (config) {
  const { env } = config

  for (const attr in env) {
    !process.env[attr] && (process.env[attr] = env[attr])
  }

  if (config.exec_mode === 'cluster') {
    process.env.PM2_CLUSTER = 1
  }
} else {
  console.log(chalk.red('⚠️ PM2 config undefined'))
}

const packageJson = require('./package.json')
const name = packageJson.name
const script = packageJson.main

// pm2 name
const TEST_NAME = `${name}/test`
const PROD_NAME = `${name}/production`

// NODE ENV
const TEST_NODE_ENV = 'test'
const PROD_NODE_ENV = 'production'

// 端口号
const PORT = 10001

// DB 配置
const { TEST_DB, PROD_DB } = require('./config.db')

// PM2 配置
module.exports = {
  apps: [
    {
      name: TEST_NAME,
      script,
      env: {
        NODE_ENV: TEST_NODE_ENV,
        DB: JSON.stringify(TEST_DB),
        PORT
      }
    },
    {
      name: PROD_NAME,
      script,
      // exec_mode: 'cluster',
      // instances: 3,
      // instance_var: 'INSTANCE_ID',
      env: {
        NODE_ENV: PROD_NODE_ENV,
        DB: JSON.stringify(PROD_DB),
        PORT
      }
    }
  ]
}

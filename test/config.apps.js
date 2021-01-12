const apps = require('../apps')

const DB = [
  {
    name: 'test',
    db: 'test',
    host: 'legox.yy.com',
    account: 'yyued',
    password: 'yyued123'
    // logging: true
  },
  {
    name: 'test1',
    db: 'test1',
    host: 'legox.yy.com',
    account: 'yyued',
    password: 'yyued123'
  }
]

module.exports = apps([
  {
    alias: 'kmdemo',
    env: {
      NODE_ENV: 'test',
      DB,
      XX: [],
      YY: () => {
        console.log(123)
        return 123
      },
      PORT: 3000
    }
  },
  {
    alias: 'kmdemo',
    env: {
      NODE_ENV: 'production',
      DB,
      XX: [],
      YY: () => {
        console.log(123)
        return 123
      },
      PORT: 3001
    }
  }
])

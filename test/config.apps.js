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

module.exports = {
  apps: [
    {
      name: 'test',
      env: {
        NODE_ENV: 'test',
        DB: JSON.stringify(DB),
        PORT: 3000
      }
    },
    {
      name: 'production',
      env: {
        NODE_ENV: 'production',
        DB: JSON.stringify(DB),
        PORT: 3001
      }
    }
  ]
}

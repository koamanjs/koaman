module.exports = function ({ router, controller, upload }) {
  router.get('/', controller.Home.index)
  router.get('/test', controller.test)
  router.get('/code', controller.Home.code)
  router.get('/error', controller.Home.error)

  router.post('/post', ctx => {
    ctx.body = ctx.request.body
  })

  // 测试 redis
  router.get('/redis', async ctx => {
    // ctx.redis.del('test')
    // ctx.redis.set('test', Date().toString(), 'EX', 60)
    ctx.body = (await ctx.redis.get('test')) || 'null'
  })

  // 测试 service function
  router.get('/func', async ctx => {
    ctx.body = await ctx.service.Func(123)
  })

  // 测试上传
  router.post('/upload', upload('root').single('image'), controller.Home.upload)

  // 测试请求 udp 服务
  router.get('/udp', async ctx => {
    try {
      ctx.body = await ctx.udp['test/udp/correct']({ id: 340 })
    } catch (error) {
      console.error('error', error)
    }
  })
  router.get('/udp/error', async ctx => {
    try {
      ctx.body = await ctx.udp['test/udp/error']()
    } catch (error) {
      console.log('>>> udp error', error)
      ctx.body = error
    }
  })

  // 测试监听 udp 服务 - 正确返回
  router.udp('/udp/correct', ctx => ctx.udpSend({ correct: { udpParams: ctx.udpParams } }))
  // 测试监听 udp 服务 - 错误返回
  router.udp('/udp/error', ctx => ctx.udpError('我是错误'))

  router.get('/util', ctx => {
    ctx.body = ctx.util.day('2020-06-10 00:00:00')
  })

  router.get('/number', controller.Home.number)

  router.get('/params/:id', ctx => {
    console.log(ctx.params)
    console.log(ctx.request.params)
    console.log(ctx.request.query)
    console.log(ctx.request.body)
  })
}

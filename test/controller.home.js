class Home {
  async index (ctx) {
    ctx.logger.trace('controller Home-index')
    ctx.body = ctx.util.sayHello((await ctx.service.User.find(1)).name)
  }

  code (ctx) {
    ctx.body = ++ctx.store.code
  }

  async number (ctx) {
    const number = await ctx.model.Number.findOne({ where: { id: 1 } })
    ++number.number
    await number.save()
    ctx.body = number.number
  }

  upload (ctx) {
    console.log(ctx.request.body)
    ctx.body = ctx.request.file
  }

  error (ctx) {
    // x+1
    // throw ctx.error(401, 'asdasd')
    throw ctx.error('测试错误')
  }
}

module.exports = Home

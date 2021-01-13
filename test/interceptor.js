// 服务启动拦截器
module.exports = async function (app) {
  console.log('interceptor...')

  await new Promise(resolve => setTimeout(resolve, 1000))

  app.context.store = {}
  app.context.store.code = 1
}

module.exports = async function (app) {
  // await new Promise(resolve => setTimeout(resolve, 10000))

  app.context.store = {}

  app.context.store.code = 1
}

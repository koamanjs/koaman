const Koa = require('koaman')
const app = new Koa()

app
  .cors()
  .logger()
  .errorHandler()
  .util()
  // .model()
  .controller()
  .router()

app.start()

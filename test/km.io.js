module.exports = ctx => {
  console.log(3333)
  ctx.io.on('connect', socket => {
    console.log(123123)
  })
}

const Func = async function (code) {
  this.ctx.logger.trace('service func')
  return code
}

module.exports = Func

class User {
  async find (id) {
    return (await this.ctx.model.User.findOne({ where: { id } }) || {})
  }

  log (user) {
    console.log('[User Service]', user)
  }
}

module.exports = User

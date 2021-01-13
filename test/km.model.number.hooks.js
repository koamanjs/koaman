// 约定 km.model.$name.hook.js 指定为 km.model.$name.yml Sequelize ORM Hook
module.exports = ({ context, model }) => {
  model.addHook('afterUpdate', 'afterSave', async data => {
    context.service.User.log(data.toJSON())
  })
}

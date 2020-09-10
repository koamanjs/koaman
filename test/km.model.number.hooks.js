module.exports = ({ context, model }) => {
  model.addHook('afterUpdate', 'afterSave', async data => {
    context.service.User.log(data.toJSON())
  })
}

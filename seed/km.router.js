module.exports = function ({ router, controller }) {
  router.get('/', controller.Home.hello)
}

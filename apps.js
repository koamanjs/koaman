const path = require('path')
const fs = require('fs')

const packageJson = (() => {
  const packageJsonPath = path.resolve(module.parent.path, 'package.json')
  return fs.existsSync(packageJsonPath) ? require(packageJsonPath) : undefined
})()

module.exports = options => {
  const apps = []

  for (const item of options) {
    if (!item.script && packageJson && packageJson.main) {
      item.script = packageJson.main
    }

    if (item.env) {
      for (const key of Object.keys(item.env)) {
        const value = item.env[key]
        if (typeof value === 'object') {
          item.env[key] = JSON.stringify(value)
        }
        if (typeof value === 'function') {
          item.env[key] = value()
        }
      }
    }

    if (!item.name && packageJson && packageJson.name && item.env && item.env.NODE_ENV) {
      item.name = `${packageJson.name}/${item.env.NODE_ENV}`
    }

    if (item.alias && item.env && item.env.NODE_ENV) {
      item.name = `${item.alias}/${item.env.NODE_ENV}`
    }

    apps.push(item)
  }

  return { apps }
}

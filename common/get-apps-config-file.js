const fs = require('fs')
const path = require('path')
const rootDir = process.cwd()

module.exports = function () {
  const pm2configFile = path.resolve(rootDir, 'config.pm2.js')
  if (fs.existsSync(pm2configFile)) {
    return pm2configFile
  }
  return path.resolve(rootDir, 'config.apps.js')
}

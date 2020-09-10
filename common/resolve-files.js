const path = require('path')
const glob = require('glob')

module.exports = filesPath => glob.sync(path.isAbsolute(filesPath) ? filesPath : path.resolve(process.cwd(), filesPath))

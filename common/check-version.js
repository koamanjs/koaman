const path = require('path')
const fs = require('fs')
const root = process.cwd()
const packageJsonPath = path.resolve(root, 'package.json')
const koamanPackageJsonPath = path.resolve(root, 'node_modules/koaman/package.json')

if (fs.existsSync(packageJsonPath) && fs.existsSync(koamanPackageJsonPath)) {
  const packageJson = require(packageJsonPath)
  const koamanPackageJson = require(koamanPackageJsonPath)

  // 依赖 koaman
  if (packageJson.dependencies && packageJson.dependencies.koaman) {
    const version = packageJson.dependencies.koaman
    const installVersion = koamanPackageJson.version

    if (version[0] !== '~' && version[0] !== '^' && koamanPackageJson.version !== version) {
      console.error(`[KoaMan] 依赖与安装版本不一致，dependencies: ${version}, install: ${installVersion}\n`)
      process.exit(1)
    }
  }
}

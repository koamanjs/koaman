/**
 * 数据模型
 */
const path = require('path')
const day = require('dayjs')
const fs = require('fs')
const Koa = require('koa')
const chalk = require('chalk')
const resolveFiles = require('./common/resolve-files')

Koa.prototype.model = function (filesName = 'km.model.*') {
  const files = resolveFiles(filesName)

  if (!process.env.DB && files.length > 0) {
    console.log(chalk.red('⚠️ DB config undefined'))
    return this
  }

  const Sequelize = require('sequelize')
  const DB = JSON.parse(process.env.DB)
  const isMultipleDB = Array.isArray(DB)
  const logger = this.context.logger || console
  let sequelize = {}

  // 初始化 DB Sequelize
  const initSequelize = ({ host, db, account, password, pool, port, logging }) => new Sequelize(db, account, password, {
    host,
    port: port || 3306,
    dialect: 'mysql',
    pool: pool || {
      max: 20,
      min: 0,
      idle: 20000,
      acquire: 20000
    },
    dialectOptions: {
      charset: 'utf8'
    },
    logging: (logging === undefined ? false : logging) ? console.log : undefined,
    timezone: '+08:00'
  })

  // 多 sequelize 实例
  if (isMultipleDB) {
    DB.forEach(item => item.name && (sequelize[item.name] = initSequelize({ ...item })))
  } else {
    // 单一 sequelize 实例
    sequelize = initSequelize({ ...DB })
  }

  this.context.model = {}

  for (const file of files) {
    const basename = path.basename(file)

    if (file.indexOf('hooks.js') > 0) continue

    if (basename.indexOf('.yml') > 0) {
      // Yaml model
      const yaml = require('js-yaml')
      let config = yaml.safeLoad(fs.readFileSync(file, 'utf8'))
      const field = {}

      if (config.extend) {
        const extendYamls = files.filter(file => {
          if (path.basename(file) === `km.model.${config.extend}.yml`) {
            return file
          }
        })
        if (extendYamls.length !== 1) {
          throw Error(`ModelYaml(${config.name}) extend error`)
        }
        const extendConfig = yaml.safeLoad(fs.readFileSync(extendYamls[0], 'utf8'))
        config = Object.assign(extendConfig, config)
      }

      // 如果有带 field
      if (config.field) {
        for (const key of Object.keys(config.field)) {
          const value = config.field[key]
          const keyHump = require('./common/to-hump')(key)
          switch (value) {
            case 'ID':
              field[keyHump] = {
                field: key,
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
              }
              break
            case 'JSONARRAY':
              field[keyHump] = {
                field: key,
                type: Sequelize.STRING,
                defaultValue: '[]',
                get () {
                  const jsonArray = this.getDataValue(keyHump)
                  try {
                    if (jsonArray) {
                      return JSON.parse(jsonArray)
                    }
                  } catch (error) {
                    logger.error(`[JSONARRAY(${keyHump}) Getter Error]`, error)
                  }
                  return []
                },
                set (value) {
                  try {
                    !value && (value = [])
                    this.setDataValue(keyHump, JSON.stringify(value))
                  } catch (error) {
                    logger.error(`[JSONARRAY(${keyHump}) Setter Error]`, error)
                    this.setDataValue(keyHump, '[]')
                  }
                }
              }
              break
            case 'JSONOBJECT':
              field[keyHump] = {
                field: key,
                type: Sequelize.STRING,
                defaultValue: '{}',
                get () {
                  const jsonObject = this.getDataValue(keyHump)
                  try {
                    if (jsonObject) {
                      return JSON.parse(jsonObject)
                    }
                  } catch (error) {
                    logger.error(`[JSONOBJECT(${keyHump}) Getter Error]`, error)
                  }
                  return []
                },
                set (value) {
                  try {
                    !value && (value = {})
                    this.setDataValue(keyHump, JSON.stringify(value))
                  } catch (error) {
                    logger.error(`[JSONOBJECT(${keyHump}) Setter Error]`, error)
                    this.setDataValue(keyHump, '{}')
                  }
                }
              }
              break
            case 'TODAYTIME':
              field[keyHump] = {
                field: key,
                type: Sequelize.STRING,
                defaultValue: () => day().format('YYYY-MM-DD HH:mm:ss')
              }
              break
            default:
              field[keyHump] = {
                field: key,
                type: Sequelize[value]
              }
              break
          }
        }
      }

      const dbName = config.db

      if (isMultipleDB && !dbName && !sequelize[dbName]) {
        throw Error(`ModelYaml(${config.name}) DB undefined`)
      }

      let model

      // 是否带 sequelize 实例命名空间
      if (dbName) {
        model = sequelize[dbName].define(config.table, field, { freezeTableName: true, timestamps: false })
      } else {
        model = sequelize.define(config.table, field, { freezeTableName: true, timestamps: false })
      }

      // model hook.js
      const hooksFile = resolveFiles(path.basename(basename, '.yml') + '.hooks.js')[0]
      if (hooksFile) {
        require(hooksFile)({ context: this.context, model })
      }

      this.context.model[config.name] = model
    } else {
      // JS model
      const ModelClass = require(file)
      const modelClass = new ModelClass()
      const dbName = (modelClass.db || '')

      if (isMultipleDB && !dbName && !sequelize[dbName]) {
        throw Error(`ModelClass(${ModelClass.name}) DB undefined`)
      }

      let model

      // 是否带 sequelize 实例命名空间
      if (dbName) {
        model = sequelize[dbName].define(modelClass.table, modelClass.field, { freezeTableName: true, timestamps: false })
      } else {
        model = sequelize.define(modelClass.table, modelClass.field, { freezeTableName: true, timestamps: false })
      }

      // 方便注入 sequelize hook 钩子
      if (modelClass.hooks) {
        modelClass.hooks({ context: this.context, model })
      }

      this.context.model[ModelClass.name] = model
    }
  }

  // 连接数据库
  if (isMultipleDB) {
    for (const item of Object.keys(sequelize)) {
      sequelize[item].sync()
    }
  } else {
    sequelize.sync()
  }

  // 获取 DB sequelize 实例
  this.context.DBClient = name => {
    if (isMultipleDB && !name) {
      return undefined
    }
    return isMultipleDB ? sequelize[name] : sequelize
  }

  return this
}

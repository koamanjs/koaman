const path = require('path')
const fs = require('fs')
const Koa = require('koa')

Koa.prototype.upload = function (folderPath = process.cwd()) {
  const multer = require('@koa/multer')
  const shortid = require('shortid')

  const createMulter = folderPath => {
    return multer({
      storage: multer.diskStorage({
        destination (req, file, cb) {
          cb(null, folderPath)
        },
        filename (req, file, cb) {
          const extname = path.extname(file.originalname)
          const timestamp = Date.now()
          const id = shortid.generate()

          cb(null, `${timestamp}${id}${extname}`)
        }
      })
    })
  }

  const uploadSpace = {}

  switch (typeof folderPath) {
    // 单个上传文件夹
    case 'string': {
      !fs.existsSync(folderPath) && fs.mkdirSync(folderPath)
      uploadSpace.defalut = createMulter(folderPath)
      break
    }
    // 多个上传文件夹
    case 'object': {
      for (const name of Object.keys(folderPath)) {
        const itemFolderPath = folderPath[name]

        !fs.existsSync(itemFolderPath) && fs.mkdirSync(itemFolderPath)
        uploadSpace[name] = createMulter(itemFolderPath)
      }
      break
    }
  }

  this.context.upload = name => {
    if (!name) {
      return uploadSpace.defalut
    }
    return uploadSpace[name]
  }

  return this
}

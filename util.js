const util = {}

// 判断是否测试环境
util.isTestEnv = process.env.NODE_ENV === 'test'

// 当前格式化时间
util.day = time => require('dayjs')(time).format('YYYY-MM-DD HH:mm:ss')

// 生成 uuid
util.uuid = require('./common/uuid')

// 指定范围随机数
util.random = require('./common/random')

// 下划线字符串转为驼峰
util.toHump = require('./common/to-hump')

// 对比版本号
util.compareVersion = require('./common/compare-version')

// 裁剪空格
util.trimSpace = require('./common/trim-space')

// 前缀补充零位
util.padZero = require('./common/pad-zero')

// 千分位逗号
util.thousandsDot = require('./common/thousands-dot')

// 类型检测库
util.type = require('./common/type')

// 简单 clone
util.clone = data => JSON.parse(JSON.stringify(data))

module.exports = util

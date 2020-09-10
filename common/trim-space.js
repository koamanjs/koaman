/**
 * 裁剪所有空格
 *
 * @param {String} str
 * @return {String}
 */
module.exports = str => str.replace(/(^\s+)|(\s+)/g, '')

module.exports = string => string.replace(/_(\w)/g, (all, letter) => {
  return letter.toUpperCase()
})

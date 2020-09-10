module.exports = () => {
  const os = require('os')
  const iptable = {}
  const ifaces = os.networkInterfaces()

  for (var dev in ifaces) {
    ifaces[dev].forEach((details, alias) => {
      if ((details.family === 'IPv4') && (details.internal === false)) {
        iptable.localIP = details.address
      }
    })
  }

  return iptable.localIP
}

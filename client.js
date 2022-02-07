const ipc = require('node-ipc').default

ipc.config.id = 'runk-client'
ipc.config.silent = true

module.exports = function ({ sc, path }) {
  ipc.connectTo('runk', function () {
    ipc.of.runk.on('connect', function () {
      if (sc === 'ls') ipc.of.runk.emit('ls', path || '/')
      if (sc === 'exit') {
        ipc.of.runk.emit('exit')
        console.log('Daemon exited successfully')
        process.exit()
      }
    })
    ipc.of.runk.on('error', () => {
      console.log('cannot connect to daemon, check if it is running')
      process.exit()
    })
    ipc.of.runk.on('ls', function (data) {
      console.log('got a message from runk ls: ', data)
      process.exit()
    })
  })
}

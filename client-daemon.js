const pump = require('pump')
const bind = require('bind-easy')
const DHT = require('@hyperswarm/dht')
const minimist = require('minimist')
const ipc = require('node-ipc').default

ipc.config.id = 'runk'
ipc.config.retry = 1500

const node = new DHT()
const args = minimist(process.argv.splice(2))
let key = args.k || args.key
const mount = args.m || args.mount
const port = args.p || args.port || 8080
const address = args.a || args.address

if (key) {
  key = Buffer.from(key, 'hex')
  bind.tcp(port).then(async (server) => {
    server.on('connection', (socket) => {
      pump(socket, node.connect(key), socket)
    })
    process.send(`Listening on port ${port}\n`)
    process.send(`http://localhost:${port}`)
    if (mount) {
      await new Promise((res, rej) => {
        require('./httpfs-client').mount(key ? `http://localhost:${port}/httpfs` : address, mount, {}, (err, unmount) => {
          if (err) {
            rej(err)
          }
          process.send('\nMounted at ' + mount)
          process.on('SIGINT', unmount)
          process.on('SIGTERM', unmount)
          res()
        })
      })
    }

    ipc.serve(function () {
      ipc.server.on('ls', function (data, socket) {
        ipc.server.emit(socket, 'ls', data + ' files')
      })
      ipc.server.on('exit', () => {
        process.kill(process.pid, 'SIGINT')
      })
    })
    ipc.server.start()

    process.disconnect()
  })
}

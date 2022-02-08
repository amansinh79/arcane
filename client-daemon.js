const pump = require('pump')
const bind = require('bind-easy')
const DHT = require('@hyperswarm/dht')
const minimist = require('minimist')
const { SOCKETFILE, OS } = require('./constants')
const net = require('net')
const fs = require('fs')

const node = new DHT()
const args = minimist(process.argv.splice(2))
const key = args.k || args.key
const mount = args.m || args.mount
const port = args.p || args.port || 8080
const address = args.a || args.address

let unmount
;(async function () {
  if (OS !== 'win32') {
    await new Promise((res, rej) => {
      fs.stat(SOCKETFILE, function (err, stats) {
        if (err) {
          return res()
        }
        process.send('Daemon Already Running!')
        process.exit()
      })
    })
  }

  if (key) {
    const buf = Buffer.from(key, 'hex')
    bind.tcp(port).then((server) => {
      server.on('connection', (socket) => {
        pump(socket, node.connect(buf), socket)
      })
      process.send(`Listening on port ${port}\n`)
      process.send(`http://localhost:${port}`)
    })
  }

  if (mount) {
    await new Promise((res, rej) => {
      require('./httpfs-client').mount(key ? `http://localhost:${port}/httpfs` : address, mount, {}, (err, um) => {
        if (err) {
          process.send(err.message)
          process.exit()
        }
        process.send('Mounted at ' + mount)
        unmount = um
        res()
      })
    })
  }

  process.on('SIGINT', () => {
    if (OS === 'win32') process.exit()
    if (unmount) {
      unmount()
    }
    fs.unlinkSync(SOCKETFILE)
    process.exit()
  })

  net
    .createServer(function (socket) {
      socket.on('data', function (data) {
        data = JSON.parse(data)

        switch (data.sc) {
          case 'ls': {
            socket.write('files')
            break
          }
          case 'exit': {
            socket.end('Daemon Exited!')
            process.kill(process.pid, 'SIGINT')
            break
          }
        }
      })
    })
    .listen(SOCKETFILE)

  process.send('\nDaemon Listening at ' + SOCKETFILE)

  process.send('done')
})()

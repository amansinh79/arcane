const pump = require("pump")
const bind = require("bind-easy")
const DHT = require("@hyperswarm/dht")

const node = new DHT()

module.exports = function ({ key, port = 8080, mount, address }) {
  if (key) {
    key = Buffer.from(key, "hex")
    bind.tcp(port).then((server) => {
      server.on("connection", (socket) => {
        pump(socket, node.connect(key), socket)
      })
      console.log(`Listening on port ${port}\n`)
      console.log(`http://localhost:${port}`)
    })
  }

  if (mount) {
    require("./httpfs-client").mount(key ? `http://localhost:${port}/httpfs` : address, mount, {}, (err, unmount) => {
      if (err) {
        throw err
      }
      process.on("SIGINT", unmount)
      process.on("SIGTERM", unmount)
    })
  }
}

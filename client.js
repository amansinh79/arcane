const pump = require("pump")
const bind = require("bind-easy")
const dht = require("@hyperswarm/dht")

module.exports = async function ({ port = 8080, mount, key }) {
  const node = new dht()

  key = Buffer.from(key, "hex")
  await new Promise((res, rej) => {
    bind.tcp(port).then((server) => {
      server.on("connection", (socket) => {
        pump(socket, node.connect(key), socket)
      })
      res()
    })
  })

  require("./httpfs-client").mount(`http://localhost:${port}`, mount, {}, (err, unmount) => {
    if (err) {
      console.log(err.message)
      process.exit()
    }
    console.log("Mounted at " + mount)
    process.on("SIGINT", unmount)
  })
}

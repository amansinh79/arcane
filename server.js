const httpfs_srv = require("./httpfs-server")
const path = process.cwd()
const dht = require("@hyperswarm/dht")
const pump = require("pump")
const net = require("net")
const http = require("http")
const node = new dht()

let root

const server = http.createServer((req, res) => {
  let chunks = []
  req.on("data", (chunk) => chunks.push(chunk))
  req.on("end", () =>
    httpfs_srv.serve(
      root,
      Buffer.concat(chunks),
      (result) => {
        res.write(result)
        res.end()
      },
      process.env.HTTPFS_DEBUG
    )
  )
})

module.exports = function ({ port = 3333, allowWrite }) {
  if (allowWrite) root = httpfs_srv.real(path)
  else root = httpfs_srv.readOnly(httpfs_srv.real(path))

  server.listen(port, async (err) => {
    if (err) {
      return console.log("something bad happened", err)
    }
    console.log(`server is listening on ${port}`)

    const n = node.createServer()

    n.on("connection", function (noiseSocket) {
      pump(noiseSocket, net.connect(port, "localhost"), noiseSocket)
    })

    const keyPair = dht.keyPair()

    await n.listen(keyPair)

    console.log("Key :", keyPair.publicKey.toString("hex"))
  })
}

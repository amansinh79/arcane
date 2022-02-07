const express = require("express")
const urlencode = require("urlencode")
const fs = require("fs")
const tar = require("tar-fs")
const p = require("path")
const DHT = require("@hyperswarm/dht")
const pump = require("pump")
const net = require("net")
const ip = require("ip")
const prettyFileIcons = require("pretty-file-icons")
const httpfs_srv = require("./httpfs-server")
const path = process.cwd()
const node = new DHT()
const app = express()
const contentDisposition = require("content-disposition")

let root

app.set("view engine", "pug")
app.use(express.static(p.join(__dirname, "public")))
app.set("views", p.join(__dirname, "/views"))

app.get("/download/:path", async (req, res) => {
  const filePath = p.join(path, req.params.path)
  const basename = p.basename(filePath)
  const stat = fs.statSync(filePath)

  if (stat.isDirectory()) {
    res.setHeader("Content-Type", "application/tar-x")
    res.setHeader("Content-Disposition", `attachment; filename=${basename}.tar`)

    tar.pack(filePath).pipe(res)
  } else {
    const range = req.headers.range
    let stream

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-")
      const partialStart = parts[0]
      const partialEnd = parts[1]

      const start = parseInt(partialStart, 10)
      const end = partialEnd ? parseInt(partialEnd, 10) : stat.size - 1
      const chunksize = end - start + 1
      stream = fs.createReadStream(filePath, { start: start, end: end })

      res.writeHead(206, {
        "Content-Range": "bytes " + start + "-" + end + "/" + stat.size,
        "Accept-Ranges": "bytes",
        "Content-Length": chunksize,
      })
    } else {
      stream = fs.createReadStream(filePath)
      res.setHeader(
        "Content-Disposition",
        contentDisposition(basename, {
          type: "inline",
        })
      )
      res.setHeader("Content-Length", stat.size)
      res.contentType(basename)
    }

    stream.pipe(res)
  }
})

app.get("/:path?", (req, res) => {
  if (!fs.existsSync(p.join(path, req.params.path || ""))) return res.send("Path Does Not Exists!")

  const files = fs.readdirSync(p.join(path, req.params.path || ""), {
    withFileTypes: true,
  })

  res.render("index", {
    title: "Runk",
    message: "Hello there!",
    back: p.join(),
    path: req.params.path ? "/" + req.params.path : "/",
    files: files.map((f) => ({
      name: f.name,
      isDir: f.isDirectory(),
      path: urlencode(req.params.path ? p.join(req.params.path, f.name) : f.name),
      icon: f.isDirectory() ? null : prettyFileIcons.getIcon(f.name, "svg"),
    })),
  })
})

app.post("/httpfs", (req, res) => {
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

module.exports = function ({ port = 3333, local, allowWrite }) {
  if (allowWrite) root = httpfs_srv.real(path)
  else root = httpfs_srv.readOnly(httpfs_srv.real(path))

  app.listen(port, () => {
    console.log(`Server Listening on port ${port}!\n`)
    console.log(`http://localhost:${port}\n`)
    console.log(`http://${ip.address()}:${port}\n`)
    console.log(`httpfs: http://${ip.address()}:${port}/httpfs\n`)

    if (local) return

    const server = node.createServer((socket) => {
      pump(socket, net.connect(port, "localhost"), socket)
    })

    server.listen().then(() => {
      console.log("DHT key:", server.address().publicKey.toString("hex"))
    })
  })
}

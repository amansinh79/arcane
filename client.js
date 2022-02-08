const net = require('net')
const SOCKETFILE = require('./constants').SOCKETFILE

module.exports = function ({ sc, path }) {
  const socket = net.connect(SOCKETFILE)
  socket.write(JSON.stringify({ sc, path }))
  socket.on('data', (data) => {
    console.log(data.toString())
    socket.end()
  })
}

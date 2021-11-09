const pump = require("pump");
const bind = require("bind-easy");
const DHT = require("@hyperswarm/dht");

const node = new DHT();

module.exports = function ({ key, port = 8080 }) {
  key = Buffer.from(key, "hex");
  bind.tcp(port).then((server) => {
    server.on("connection", (socket) => {
      pump(socket, node.connect(key), socket);
    });
    console.log(`Listening on port ${port}\n`);
    console.log(`http://localhost:${port}`);
  });
};

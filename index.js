#!/usr/bin/env node

const { program } = require("commander")

program
  .name("runk")
  .option("-p, --port <port>", "port to run on [optional]")
  .option("-k, --key <key>", "dht key [required on clinet]")
  .option("-m, --mount <path>", "mount path for fuse")
  .option("-a, --address <addr>", "local address for mount")
  .option("-l, --local ", "don't use hyperswarm, to share on local devices")
  .option("-w, --allowWrite", "when using mount allow client all permissions. default READ-ONLY")
  .addHelpText(
    "before",
    `
runk is a simple file and folder sharer using hyperswarm.

Example Usage:
  Server :
      runk -p 8080
  Client :
      runk -p 3000 -k <key>

Example Usage (Mount):
    Client :
      runk -k <key> -m /home/dir/ 
  `
  )
  .parse(process.argv)

const opts = program.opts()

if (opts.key || opts.mount) {
  require("./client")(opts)
} else {
  require("./server")(opts)
}

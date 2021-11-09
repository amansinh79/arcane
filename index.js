#!/usr/bin/env node

const { program } = require("commander");

program
  .name("runk")
  .option("-p, --port <port>", "port to run on [optional]")
  .option("-k, --key <key>", "dht key [required on clinet]")
  .option("-l, --local ", "don't use hyperswarm, to share on local devices")
  .addHelpText(
    "before",
    `
runk is a simple file and folder sharer using hyperswarm.

Example Usage:
  Server :
      runk -p 8080
  Client :
      runk -p 3000 -k <key>
  `
  )
  .parse(process.argv);

const opts = program.opts();

if (opts.key) {
  require("./client")(opts);
} else {
  require("./server")(opts);
}

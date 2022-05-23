#!/usr/bin/env node

const minimist = require("minimist")

const args = process.argv.splice(2)

const opts = minimist(args)

if (opts.h || opts.help) {
  console.log(`           
   __ _ _ __ ___ 
  / _\` | '__/ __|
 | (_| | | | (__ 
  \\__,_|_|  \\___|


  It is a simple folder mounter over network.

  Example Usage:
     Server :
         arc -p 8080
     Client :
         arc-mnt -k <key> -m /home/dir/

  Options:
      -p, --port <port>     port to run on [optional]
      -k, --key <key>       dht key [required on client]
      -m, --mount <path>    path to mount 
      -w, --allowWrite      when using mount allow client all permissions. default READ-ONLY
      -v, --version         print version
      -h, --help            display help for command
  `)
} else if (opts.v || opts.version) {
  console.log("arc", require("./package.json").version)
} else {
  opts.port = opts.p || opts.port
  opts.key = opts.k || opts.key
  opts.allowWrite = opts.w || opts.allowWrite
  opts.mount = opts.m || opts.mount

  if (opts.key) {
    require("./client")(opts)
  } else {
    require("./server")(opts)
  }
}

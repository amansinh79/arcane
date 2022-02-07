#!/usr/bin/env node

const cp = require('child_process')
const { createWriteStream } = require('fs')
const minimist = require('minimist')

const args = process.argv.splice(2)

const opts = minimist(args)

if (opts.h || opts.help) {
  console.log(` runk is a simple file and folder sharer using hyperswarm.

   Example Usage:
     Server :
         runk -p 8080
     Client :
         runk -p 3000 -k <key>
  
   Example Usage (Mount):
       Client :
         runk -k <key> -m /home/dir/


   Options:
      -p, --port <port>     port to run on [optional]
      -k, --key <key>       dht key [required on clinet]
      -m, --mount <path>    mount path for fuse
      -a, --address <addr>  local address for mount
      -l, --local           don't use hyperswarm, to share on local devices
      -w, --allowWrite      when using mount allow client all permissions. default READ-ONLY
      -v, --version         print version
      -h, --help            display help for command
       
    Commands:
      ls <path>             print current directory
      ls exit               stop daemon
  `)
} else if (opts.v || opts.version) {
  console.log('Runk', require('./package.json').version)
} else if (opts._[0]) {
  const sc = opts._[0]
  const path = opts._[1]
  require('./client')({ sc, path })
} else {
  opts.port = opts.p || opts.port
  opts.key = opts.k || opts.key
  opts.mount = opts.m || opts.mount
  opts.address = opts.a || opts.address
  opts.local = opts.l || opts.local
  opts.allowWrite = opts.w || opts.allowWrite

  if (opts.key || opts.mount) {
    console.log('Starting client Daemon\n')
    const p = cp.spawn('node', ['client-daemon.js', ...args], {
      detached: true,
      stdio: ['ignore', 'ignore', 'inherit', 'ipc'],
    })
    p.on('message', (m) => {
      console.log(m)
    })
    p.on('disconnect', () => {
      process.exit()
    })
  } else {
    require('./server')(opts)
  }
}

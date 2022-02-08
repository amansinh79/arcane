#!/usr/bin/env node

const cp = require('child_process')
const minimist = require('minimist')
const { COMMANDS } = require('./constants')

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
      status                                print status of daemon
      ls <path>                             print current directory
      cp <path> --fs <file system path>     copy directory 
      exit                                  stop daemon
  `)
} else if (opts.v || opts.version) {
  console.log('Runk', require('./package.json').version)
} else if (opts._[0]) {
  const sc = opts._[0]
  const path = opts._[1]
  if (!COMMANDS.includes(sc)) {
    console.log('Invalid Command!', 'runk --help for help')
    process.exit()
  }
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
    const p = cp.fork('client-daemon.js', args, {
      detached: true,
    })
    p.on('message', (m) => {
      if (m === 'done') {
        p.unref()
        process.exit()
      }
      console.log(m)
    })
  } else {
    require('./server')(opts)
  }
}

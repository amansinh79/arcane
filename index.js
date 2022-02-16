#!/usr/bin/env node

const minimist = require('minimist')

const args = process.argv.splice(2)

const opts = minimist(args)

if (opts.h || opts.help) {
  console.log(`                   _    
  _ __ _   _ _ __ | | __
 | '__| | | | '_ \\| |/ /
 | |  | |_| | | | |   < 
 |_|   \\__,_|_| |_|_|\\_\\


arc is a simple file and folder sharer using hyperswarm.

  Example Usage:
     Server :
         arc -p 8080
     Client :
         arc -p 3000 -k <key>
  
  Example Usage (Mount):
       Client :
         arc -k <key> -m /home/dir/

  Example Usage (Repl):
       Client :
         arc -k <key> -r

Note : You need to provide either key or address on client

  
  Options:
      -p, --port <port>     port to run on [optional]
      -k, --key <key>       dht key [required on client]
      -m, --mount <path>    mount path for fuse
      -r, --repl            use repl to access files
      -a, --address <addr>  local ip address for mount
      -l, --local           don't use hyperswarm, to share on local devices
      -w, --allowWrite      when using mount allow client all permissions. default READ-ONLY
      -v, --version         print version
      -h, --help            display help for command
       
  Repl Commands:
      .status                                print status
      .ls                                    print contents of current directory 
      .cd <path>                             chagne directory
      .cp <path> <file system path>          copy files and directory 
      .cat <filename>                        print contents of file
      .exit                                  exit repl
  `)
} else if (opts.v || opts.version) {
  console.log('arc', require('./package.json').version)
} else {
  opts.port = opts.p || opts.port
  opts.key = opts.k || opts.key
  opts.mount = opts.m || opts.mount
  opts.address = opts.a || opts.address
  opts.local = opts.l || opts.local
  opts.allowWrite = opts.w || opts.allowWrite
  opts.repl = opts.r || opts.repl

  if (opts.key || opts.address) {
    require('./client')(opts)
  } else {
    require('./server')(opts)
  }
}

#!/usr/bin/env node

const minimist = require('minimist')

const args = process.argv.splice(2)

const opts = minimist(args)

if (opts.h || opts.help) {
  console.log(`           
   __ _ _ __ ___ 
  / _\` | '__/ __|
 | (_| | | | (__ 
  \\__,_|_|  \\___|


arc is a simple file and folder sharer on local network.

  Example Usage:
     Server :
         arc -p 8080
     Client :
         arc -a <address>
  
  Example Usage (Mount):
       Client :
         arc -a <address> -m /home/dir/

  Example Usage (Repl):
       Client :
         arc -a <address> -r

  Options:
      -p, --port <port>     port to run on [optional]
      -m, --mount <path>    mount path for fuse
      -r, --repl            use repl to access files
      -a, --address <addr>  local ip address for mount
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
  opts.allowWrite = opts.w || opts.allowWrite
  opts.repl = opts.r || opts.repl

  if (opts.address) {
    require('./client')(opts)
  } else {
    require('./server')(opts)
  }
}

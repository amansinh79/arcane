# runk

It is a simple file and folder sharer.

It uses [hyperswarm](https://www.npmjs.com/package/@hyperswarm/dht) for sharing over network.

## Installation:

### Prerequisite:

1. [Node.js](https://nodejs.org/)
2. To mount, configured [fuse-native](https://github.com/fuse-friends/fuse-native)

### Install

`npm i @solvencino/runk`

or (without installation)

`npx runk <args>`

## Usage:

You can access shared files using 3 ways.

1. browser
2. mount
3. repl

## Example Usage:

### Server :

`runk -p 8080`

### Client :

`runk -p 3000 -k <key>`

## Example Usage (Mount):

### Client :

`runk -k <key> -m /home/dir/`

## Example Usage (Repl):

### Client :

`runk -k <key> -r`

`Note : You need to provide either key or address on client`

### Options:

```
-p, --port <port> port to run on [optional]
-k, --key <key> dht key [required on client]
-m, --mount <path> mount path for fuse
-r, --repl use repl to access files
-a, --address <addr> local ip address for mount
-l, --local don't use hyperswarm, to share on local devices
-w, --allowWrite when using mount allow client all permissions. default READ-ONLY
-v, --version print version
-h, --help display help for command

Repl Commands:
.status                        print status
.ls                            print contents of current directory
.cd <path>                     chagne directory
.cp <path> <file system path>  copy files and directory
.cat <filename>                print contents of file
.help                          print help
.exit                          exit repl
```

## ToDo:

- handle more sophisticated commands in repl

## Limits:

- when downloading tar packed dir in browser, tar gets corrupted if one of the file size is more than 8GB. [GitHub issue](https://github.com/mafintosh/tar-fs/issues/100)
- when using repl to copy directories is uses [fs-stream](https://github.com/solvencino/fs-stream).

## License:

MIT

Files [httpfs-client.js](./httpfs-client.js) and [httpfs-server.js](./httpfs-server.js) are under license MPL 2.0.

Source for both files :
[httpfs](https://github.com/orgs/mozilla/repositories?q=httpfs&type=all&language=&sort=)

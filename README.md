# arcane (arc)

It is a simple file and folder sharer.

It can be used with [hyperport](https://github.com/solvencino/hyperport) for sharing over network.

## Installation:

### Prerequisite:

1. [Node.js](https://nodejs.org/)
2. To mount, [arcane-mount](https://github.com/solvencino/arcane-mount)

### Install

`npm i -g @solvencino/arc`

or (without installation)

`npx arc <args>`

## Usage:

You can access shared files using 3 ways.

1. browser
2. mount
3. repl

## Example Usage:

### Server :

`arc -p 8080`

### Client :

`arc -p 3000 -a <address>`

## Example Usage (Mount):

### Client :

`arc -a <address> -m /home/dir/`

## Example Usage (Repl):

### Client :

`arc -a <address> -r`

`Note : You need to provide address on client`

### Options:

```
-p, --port <port> port to run on [optional]
-k, --key <key> dht key [required on client]
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
- add completer in repl

## Limits:

- when downloading tar packed dir in browser, tar gets corrupted if one of the file size is more than 8GB. [GitHub issue](https://github.com/mafintosh/tar-fs/issues/100)
- when using repl to copy directories is uses [fs-stream](https://github.com/solvencino/fs-stream).

## License:

MIT

File [httpfs-server.js](./httpfs-server.js) are under license MPL 2.0.

Source for file :
[httpfs](https://github.com/orgs/mozilla/repositories?q=httpfs&type=all&language=&sort=)

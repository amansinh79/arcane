# runk

It is a simple file and folder sharer.

It uses [tar-fs](https://www.npmjs.com/package/tar-fs) to pack direcotries and [hyperswarm](https://www.npmjs.com/package/@hyperswarm/dht) for sharing over network.

## Usage:

runk is a simple file and folder sharer using hyperswarm.

### Server :

runk -p 8080

### Client :

runk -p 3000 -k <key>

### Mount:

Client :
runk -k <key> -m /home/dir/

### Options:

-p, --port <port> port to run on [optional]

-k, --key <key> dht key [required on clinet]

-m, --mount <path> mount path for fuse

-a, --address <addr> local address for mount

-l, --local don't use hyperswarm, to share on local devices

-w, --allowWrite when using mount allow client all permissions. default READ-ONLY

-v, --version print version

-h, --help display help for command

### SubCommands:

status print status of daemon

ls <path> print current directory

cp <path> <file system path> copy directory

exit stop daemon

## License:

MIT

Files [httpfs-client.js](./httpfs-client.js) and [httpfs-server.js](httpfs-server.js) are under MPL 2.0.

Source for both files :
[httpfs](https://github.com/orgs/mozilla/repositories?q=httpfs&type=all&language=&sort=)

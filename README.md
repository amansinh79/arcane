# runk

It is a simple file and folder sharer.

It uses [tar-fs](https://www.npmjs.com/package/tar-fs) to pack direcotries and [hyperswarm](https://www.npmjs.com/package/@hyperswarm/dht) for sharing over network.

## Usage:

### Server :

runk -p 8080

### Client :

runk -p 3000 -k <key>

## Options:

-p, --port : port to run on [optional]

-k, --key : dht key [required on clinet]

-l, --local : don't use hyperswarm, to share on local devices

-h, --help : display help for command

## License:

MIT

Files [httpfs-client.js](./httpfs-client.js) and [httpfs-server.js](httpfs-server.js) are under MPL 2.0.

Source for both files :
[httpfs](https://github.com/orgs/mozilla/repositories?q=httpfs&type=all&language=&sort=)

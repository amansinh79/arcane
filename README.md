# runk

it is a simple file and folder sharer.

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

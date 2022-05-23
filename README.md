# arcane (arc)

It is a simple folder mounter over network.

Only works on linux, until i find dokany or winfsp bindings for JS.

### Install

`npm i -g @solvencino/arc`

or (without installation)

`npx arc <args>`

## Example Usage:

### Server :

`arc -p 8080` -> key

### Client :

`arc -p 3000 -k <key> -m /home/dir/`

### Options:

```
 -p, --port <port>     port to run on [optional]
 -k, --key <key>       dht key [required on client]
 -m, --mount <path>    path to mount
 -w, --allowWrite      when using mount allow client all permissions. default READ-ONLY
 -v, --version         print version
 -h, --help            display help for command
```

## License:

MIT

Files [httpfs-server.js](./httpfs-server.js) and [httpfs-client.js](./httpfs-client.js) are under license MPL 2.0.

Source for both files:
[httpfs](https://github.com/orgs/mozilla/repositories?q=httpfs&type=all&language=&sort=)

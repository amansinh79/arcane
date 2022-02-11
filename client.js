const pump = require('pump')
const bind = require('bind-easy')
const DHT = require('@hyperswarm/dht')
const net = require('net')
const node = new DHT()
const { start } = require('repl')
const path = require('path')
const { default: axios } = require('axios')
const chalk = require('chalk')
const urlencode = require('urlencode')

module.exports = async function ({ key, mount, repl, port = 8080, address }) {
  if (key) {
    await new Promise((res, rej) => {
      const buf = Buffer.from(key, 'hex')
      bind.tcp(port).then((server) => {
        server.on('connection', (socket) => {
          pump(socket, key ? node.connect(buf) : net.connect(`http://${address}`), socket)
        })
        console.log(`Listening on port ${port}\n`)
        console.log(`http://localhost:${port}\n`)
        res()
      })
    })
  }

  if (mount) {
    require('./httpfs-client').mount(key ? `http://localhost:${port}/httpfs` : `http://${address}/httpfs`, mount, {}, (err, unmount) => {
      if (err) {
        console.log(err.message)
        process.exit()
      }
      console.log('Mounted at ' + mount)
      process.on('SIGINT', unmount)
    })
  }

  if (repl) {
    let pwd = path.sep
    const client = axios.create({
      baseURL: key ? `http://localhost:${port}` : `http://${address}`,
      params: {
        raw: true,
      },
      validateStatus: () => true,
    })

    const replServer = start({
      prompt: `Runk : ${path.sep} > `,
    })

    replServer.on('exit', () => {
      process.kill(process.pid, 'SIGINT')
    })

    replServer.defineCommand('ls', async (cmd) => {
      const res = await client.get('/' + urlencode(path.join(pwd, cmd)))

      if (res.status === 200) {
        const files = res.data
          .map((entry) => {
            return entry.isDir ? chalk.bold.blueBright(entry.name) : entry.name
          })
          .join(' ')
        console.log(files)
      } else {
        console.log('Invalid Path')
      }
      replServer.displayPrompt()
    })

    replServer.defineCommand('cd', async (text) => {
      const res = await client.get('/' + urlencode(path.join(pwd, text)), {
        params: {
          check: true,
        },
      })
      if (res.status === 200) {
        pwd = path.join(pwd, text)
        replServer.setPrompt(`Runk : ${pwd} > `)
      } else {
        console.log('Invalid Path!')
      }
      replServer.displayPrompt()
    })

    replServer.defineCommand('clear', () => {
      process.stdout.write('\033c')
      replServer.displayPrompt()
    })

    replServer.defineCommand('cat', async (text) => {
      const res = await client.get('/download/' + urlencode(path.join(pwd, text)), {
        responseType: 'stream',
        params: {
          raw: true,
        },
      })
      res.data.on('end', () => {
        replServer.displayPrompt()
      })
      if (res.status === 200) pump(res.data, process.stdout)
      else {
        console.log('File not found!')
        replServer.displayPrompt()
      }
    })

    replServer.defineCommand('help', () => {
      console.log(
        `status                                print status
ls                                    print contents of current directory 
cd                                    chagne directory
cp <path> <file system path>          copy files and directory 
cat <filename>                        print contents of file
exit                                  stop repl`
      )

      replServer.displayPrompt()
    })
  }
}

const { platform } = require('os')
const path = require('path')

module.exports = {
  SOCKETFILE: platform() === 'win32' ? path.join('\\\\?\\pipe', 'runk') : '/tmp/runk.sock',
  OS: platform(),
  COMMANDS: ['ls', 'exit'],
}

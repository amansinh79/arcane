const url = require("url")
const matcher = require("matcher")
const Fuse = require("fuse-native")
const Agent = require("agentkeepalive")
const { deserialize, serialize } = require("v8")
exports.mount = function (endpoint, mountpoint, options, callback) {
  endpoint = url.parse(endpoint)

  let calls = []
  let running = true
  let blocksize = options.blocksize || 1024 * 1024
  let timeout = options.timeout || 60 * 60

  let attrcache
  if (options.attrcache) {
    attrcache = {}
  }

  let cache
  if (options.cache) {
    cache = []
  }

  let http
  let agent
  if (endpoint.protocol == "https:") {
    http = require("https")
    agent = new Agent.HttpsAgent()
  } else {
    http = require("http")
    agent = new Agent()
  }

  function logDebug() {}

  function removeCall(call) {
    let index = calls.indexOf(call)
    if (index >= 0) {
      calls.splice(index, 1)
    }
  }

  function sendRequest(call, retries) {
    let buffer = serialize({ operation: call.operation, args: call.args })
    let httpOptions = {
      method: "POST",
      protocol: endpoint.protocol,
      hostname: endpoint.hostname,
      path: endpoint.path,
      port: endpoint.port || (endpoint.protocol == "https:" ? 443 : 80),
      agent: agent,
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Length": buffer.length,
      },
    }
    if (options.headers) {
      for (let header of Object.keys(options.headers)) {
        httpOptions.headers[header] = options.headers[header]
      }
    }
    if (endpoint.protocol == "https:" && options.certificate) {
      httpOptions.ca = [options.certificate]
    }
    let handleError = (errno) => {
      if (retries > 0) {
        delete call.request
        call.timer = setTimeout(() => {
          logDebug("sending (" + retries + " tries left)", call.operation)
          sendRequest(call, retries - 1)
        }, 1000)
      } else {
        removeCall(call)
        if (call.callback) {
          call.callback(errno)
        }
      }
    }
    call.request = http.request(httpOptions, (res) => {
      let chunks = []
      res.on("data", (chunk) => chunks.push(chunk))
      res.on("end", () => {
        if (res.statusCode != 200) {
          logDebug("Status code " + res.statusCode)
          return handleError(-70)
        }
        let result
        try {
          result = deserialize(Buffer.concat(chunks))
        } catch (ex) {
          logDebug("Problem parsing response buffer")
          return handleError(-70)
        }
        removeCall(call)
        call.callback.apply(null, result)
      })
    })
    call.request.on("error", (err) => {
      logDebug("HTTP error", err)
      handleError(err && typeof err.errno === "number" ? err.errno : -70)
    })
    call.request.end(buffer)
  }

  function performP(operation, callback, p, ...args) {
    if (running) {
      let call = { operation: operation, callback: callback, args: [p, ...args] }
      calls.push(call)
      logDebug("sending", operation, p)
      sendRequest(call, timeout)
    } else {
      callback(-70)
    }
  }

  function performI(operation, callback, p, ...args) {
    setAttrCache(p)
    performP(operation, callback, p, ...args)
  }

  function logAndPerformP(operation, callback, p, ...args) {
    // logDebug(operation, p)
    performP(operation, callback, p, ...args)
  }

  function logAndPerformI(operation, callback, p, ...args) {
    // logDebug(operation, p)
    performI(operation, callback, p, ...args)
  }

  function getAttrCache(p) {
    return attrcache && attrcache[p]
  }

  function setAttrCache(p, stat) {
    if (attrcache) {
      if (stat) {
        attrcache[p] = stat
      } else if (attrcache[p]) {
        delete attrcache[p]
      }
    }
  }

  function shouldCache(p) {
    if (cache) {
      if (options.nocache) {
        for (let pattern of options.nocache) {
          if (matcher.isMatch(p, pattern)) {
            logDebug("no caching", options.nocache, p)
            return false
          }
        }
      }
      return true
    } else {
      return false
    }
  }

  function createDescriptor(p) {
    return shouldCache(p) ? createCache(p) : 0
  }

  function isCached(fd) {
    return fd > 0
  }

  function createCache(p) {
    for (let i = 1; i <= cache.length + 1; i++) {
      if (!cache[i]) {
        cache[i] = {
          p: p,
          write: {
            off: 0,
            pos: 0,
            blocks: [],
          },
          read: {
            off: 0,
            block: null,
          },
        }
        return i
      }
    }
  }

  function readFromCache(fd, off, len, buf, cb) {
    let file = cache[fd]
    let rc = file.read
    if (rc.block && off >= rc.off && off + len <= rc.off + rc.block.length) {
      let boff = off - rc.off
      rc.block.copy(buf, 0, boff, boff + len)
      cb(len)
    } else {
      performP(
        "read",
        (code, resultBuffer) => {
          if (code >= 0 && resultBuffer) {
            rc.off = off
            rc.block = Buffer.from(resultBuffer)
            let elen = Math.min(len, rc.block.length)
            rc.block.copy(buf, 0, 0, elen)
            cb(elen)
          } else {
            cb(code < 0 ? code : -70)
          }
        },
        file.p,
        off,
        Math.max(len, blocksize)
      )
    }
  }

  function flushCacheFile(file, cb) {
    let wc = file.write
    if (wc.blocks.length > 0) {
      let off = wc.off
      wc.off = 0
      wc.pos = 0
      let buf = Buffer.concat(wc.blocks)
      wc.blocks = []
      performI("write", (len) => (len < 0 ? cb(len) : cb(0)), file.p, buf, off)
    } else {
      cb(0)
    }
  }

  function flushCacheDescriptor(fd, cb) {
    let file = cache[fd]
    flushCacheFile(file, cb)
  }

  function writeToCache(fd, off, buf, cb) {
    buf = Buffer.from(buf)
    let file = cache[fd]
    let wc = file.write
    if (off == wc.pos && wc.pos - wc.off + buf.length <= blocksize) {
      wc.blocks.push(buf)
      wc.pos += buf.length
      cb(buf.length)
    } else {
      flushCacheFile(file, (code) => {
        if (buf.length > blocksize) {
          performI("write", cb, file.p, buf, off)
        } else {
          wc.blocks.push(buf)
          wc.off = off
          wc.pos = off + buf.length
          cb(buf.length)
        }
      })
    }
  }

  function releaseCache(fd, cb) {
    let file = cache[fd]
    delete cache[fd]
    flushCacheFile(file, cb)
  }

  const ops = {
    getattr: (p, cb) => {
      logDebug("getattr", p)
      let cached = getAttrCache(p)
      if (cached) {
        cb(cached.code, cached.stat)
      } else {
        performP(
          "getattr",
          (code, stat) => {
            setAttrCache(p, { code: code, stat: stat })
            cb(code, stat)
          },
          p
        )
      }
    },
    open: (p, flags, cb) => {
      logDebug("open", p)
      let fd = createDescriptor(p)
      cb(0, fd)
    },
    create: (p, mode, cb) => {
      logDebug("create", p)
      performI("create", (code) => (code < 0 ? cb(code) : cb(0, createDescriptor(p))), p, mode)
    },
    read: (p, fd, buf, len, off, cb) => {
      logDebug("read", p)
      if (isCached(fd)) {
        readFromCache(fd, off, len, buf, cb)
      } else {
        performP(
          "read",
          (code, resultBuffer) => {
            if (code >= 0 && resultBuffer) {
              resultBuffer.copy(buf)
              cb(resultBuffer.length)
            } else {
              cb(code < 0 ? code : -70)
            }
          },
          p,
          off,
          len
        )
      }
    },
    write: (p, fd, buf, len, off, cb) => {
      logDebug("write", p)
      let abuf = buf.length == len ? buf : buf.slice(0, len)
      if (isCached(fd)) {
        writeToCache(fd, off, abuf, cb)
      } else {
        performI("write", cb, p, abuf, off)
      }
    },
    flush: (p, fd, cb) => {
      logDebug("flush", p)
      isCached(fd) ? flushCacheDescriptor(fd, cb) : cb(0)
    },
    release: (p, fd, cb) => {
      logDebug("release", p)
      isCached(fd) ? releaseCache(fd, cb) : cb(0)
    },
    readdir: (p, cb) => logAndPerformP("readdir", cb, p),
    truncate: (p, size, cb) => logAndPerformI("truncate", cb, p, size),
    readlink: (p, cb) => logAndPerformP("readlink", cb, p),
    chown: (p, uid, gid, cb) => logAndPerformI("chown", cb, p, uid, gid),
    chmod: (p, mode, cb) => logAndPerformI("chmod", cb, p, mode),
    utimens: (p, atime, mtime, cb) => logAndPerformI("utimens", cb, p, atime, mtime),
    unlink: (p, cb) => logAndPerformI("unlink", cb, p),
    rename: (p, dest, cb) => logAndPerformI("rename", cb, p, dest),
    link: (dest, p, cb) => logAndPerformP("link", cb, p, dest),
    symlink: (dest, p, cb) => logAndPerformP("symlink", cb, p, dest),
    mkdir: (p, mode, cb) => logAndPerformP("mkdir", cb, p, mode),
    rmdir: (p, cb) => logAndPerformI("rmdir", cb, p),
  }
  const fuse = new Fuse(mountpoint, ops, { force: true })
  fuse.mount((err) => {
    if (err) {
      console.error("problem mounting", endpoint.href, "to", mountpoint, err)
      callback(err)
    } else {
      console.log("mounted", endpoint.href, "to", mountpoint)
      callback(err, () =>
        Fuse.unmount(mountpoint, () => {
          console.log("unmounted")
          process.exit(0)
        })
      )
    }
  })
}

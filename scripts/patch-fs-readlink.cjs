const fs = require('fs');

if (!global.__fs_readlink_patched__) {
  global.__fs_readlink_patched__ = true;

  function isNextBuildDir(targetPath) {
    if (!targetPath) return false;
    const raw = typeof targetPath === 'string' ? targetPath : (targetPath && targetPath.toString ? targetPath.toString() : '');
    const normalized = raw.replace(/\\/g, '/');
    if (normalized.includes('/node_modules/') || normalized.startsWith('node_modules/') || normalized.includes('node_modules')) {
      return false;
    }
    return /(?:^|\/)(\.next|dist)(?:\/|$)/i.test(normalized);
  }

  const origReadlink = fs.readlink;
  const origReadlinkSync = fs.readlinkSync;
  const origPromisesReadlink = fs.promises ? fs.promises.readlink : null;

  fs.readlink = function(path, options, callback) {
    if (typeof options === 'function') {
      callback = options;
      options = undefined;
    }
    return origReadlink.call(fs, path, options, (err, linkString) => {
      if (err && (err.code === 'EISDIR' || err.code === 'UNKNOWN' || ((err.code === 'EPERM' || err.code === 'EACCES') && isNextBuildDir(path)))) {
        const e = new Error(`EINVAL: invalid argument, readlink '${path}'`);
        e.code = 'EINVAL';
        e.errno = -4071;
        e.syscall = 'readlink';
        e.path = path;
        return callback(e);
      }
      return callback(err, linkString);
    });
  };

  fs.readlinkSync = function(path, options) {
    try {
      return origReadlinkSync.call(fs, path, options);
    } catch (err) {
      if (err && (err.code === 'EISDIR' || err.code === 'UNKNOWN' || ((err.code === 'EPERM' || err.code === 'EACCES') && isNextBuildDir(path)))) {
        const e = new Error(`EINVAL: invalid argument, readlink '${path}'`);
        e.code = 'EINVAL';
        e.errno = -4071;
        e.syscall = 'readlink';
        e.path = path;
        throw e;
      }
      throw err;
    }
  };

  if (origPromisesReadlink) {
    fs.promises.readlink = async function(path, options) {
      try {
        return await origPromisesReadlink.call(fs.promises, path, options);
      } catch (err) {
        if (err && (err.code === 'EISDIR' || err.code === 'UNKNOWN' || ((err.code === 'EPERM' || err.code === 'EACCES') && isNextBuildDir(path)))) {
          const e = new Error(`EINVAL: invalid argument, readlink '${path}'`);
          e.code = 'EINVAL';
          e.errno = -4071;
          e.syscall = 'readlink';
          e.path = path;
          throw e;
        }
        throw err;
      }
    };
  }

  const origMkdir = fs.mkdir;
  const origMkdirSync = fs.mkdirSync;
  const origPromisesMkdir = fs.promises ? fs.promises.mkdir : null;

  fs.mkdir = function(path, options, callback) {
    if (typeof options === 'function') {
      callback = options;
      options = undefined;
    }
    return origMkdir.call(fs, path, options, (err, res) => {
      if (err && (err.code === 'EPERM' || err.code === 'EEXIST')) {
        if (isNextBuildDir(path)) {
          return callback(null, res);
        }
        try {
          if (fs.existsSync(path) && fs.statSync(path).isDirectory()) {
            return callback(null, res);
          }
        } catch (_) {}
      }
      return callback(err, res);
    });
  };

  fs.mkdirSync = function(path, options) {
    try {
      return origMkdirSync.call(fs, path, options);
    } catch (err) {
      if (err && (err.code === 'EPERM' || err.code === 'EEXIST')) {
        if (isNextBuildDir(path)) {
          return undefined;
        }
        try {
          if (fs.existsSync(path) && fs.statSync(path).isDirectory()) {
            return undefined;
          }
        } catch (_) {}
      }
      throw err;
    }
  };

  if (origPromisesMkdir) {
    fs.promises.mkdir = async function(path, options) {
      try {
        return await origPromisesMkdir.call(fs.promises, path, options);
      } catch (err) {
        if (err && (err.code === 'EPERM' || err.code === 'EEXIST')) {
          if (isNextBuildDir(path)) {
            return undefined;
          }
          try {
            if (fs.existsSync(path) && fs.statSync(path).isDirectory()) {
              return undefined;
            }
          } catch (_) {}
        }
        throw err;
      }
    };
  }

  const origReaddir = fs.readdir;
  const origReaddirSync = fs.readdirSync;
  const origPromisesReaddir = fs.promises ? fs.promises.readdir : null;

  fs.readdir = function(path, options, callback) {
    if (typeof options === 'function') {
      callback = options;
      options = undefined;
    }
    return origReaddir.call(fs, path, options, (err, files) => {
      if (err && (err.code === 'EPERM' || err.code === 'EACCES') && isNextBuildDir(path)) {
        return callback(null, []);
      }
      return callback(err, files);
    });
  };

  fs.readdirSync = function(path, options) {
    try {
      return origReaddirSync.call(fs, path, options);
    } catch (err) {
      if (err && (err.code === 'EPERM' || err.code === 'EACCES') && isNextBuildDir(path)) {
        return [];
      }
      throw err;
    }
  };

  if (origPromisesReaddir) {
    fs.promises.readdir = async function(path, options) {
      try {
        return await origPromisesReaddir.call(fs.promises, path, options);
      } catch (err) {
        if (err && (err.code === 'EPERM' || err.code === 'EACCES') && isNextBuildDir(path)) {
          return [];
        }
        throw err;
      }
    };
  }

  const origRmdir = fs.rmdir;
  const origRmdirSync = fs.rmdirSync;
  const origPromisesRmdir = fs.promises ? fs.promises.rmdir : null;

  fs.rmdir = function(path, options, callback) {
    if (typeof options === 'function') {
      callback = options;
      options = undefined;
    }
    return origRmdir.call(fs, path, options, (err) => {
      if (err && (err.code === 'EPERM' || err.code === 'ENOTEMPTY' || err.code === 'EACCES') && isNextBuildDir(path)) {
        if (fs.rm) {
          return fs.rm(path, { recursive: true, force: true, maxRetries: 3, retryDelay: 50 }, () => {
            return callback(null);
          });
        }
        return callback(null);
      }
      return callback(err);
    });
  };

  fs.rmdirSync = function(path, options) {
    try {
      return origRmdirSync.call(fs, path, options);
    } catch (err) {
      if (err && (err.code === 'EPERM' || err.code === 'ENOTEMPTY' || err.code === 'EACCES') && isNextBuildDir(path)) {
        try {
          if (fs.rmSync) {
            fs.rmSync(path, { recursive: true, force: true, maxRetries: 3, retryDelay: 50 });
            return undefined;
          }
        } catch (_) {}
        return undefined;
      }
      throw err;
    }
  };

  if (origPromisesRmdir) {
    fs.promises.rmdir = async function(path, options) {
      try {
        return await origPromisesRmdir.call(fs.promises, path, options);
      } catch (err) {
        if (err && (err.code === 'EPERM' || err.code === 'ENOTEMPTY' || err.code === 'EACCES') && isNextBuildDir(path)) {
          try {
            if (fs.promises.rm) {
              await fs.promises.rm(path, { recursive: true, force: true, maxRetries: 3, retryDelay: 50 });
            }
          } catch (_) {}
          return undefined;
        }
        throw err;
      }
    };
  }

  const origWriteFile = fs.writeFile;
  const origWriteFileSync = fs.writeFileSync;
  const origPromisesWriteFile = fs.promises ? fs.promises.writeFile : null;

  fs.writeFile = function(path, data, options, callback) {
    if (typeof options === 'function') {
      callback = options;
      options = undefined;
    }
    return origWriteFile.call(fs, path, data, options, (err) => {
      if (err && (err.code === 'EPERM' || err.code === 'EACCES') && isNextBuildDir(path)) {
        return callback(null);
      }
      return callback(err);
    });
  };

  fs.writeFileSync = function(path, data, options) {
    try {
      return origWriteFileSync.call(fs, path, data, options);
    } catch (err) {
      if (err && (err.code === 'EPERM' || err.code === 'EACCES') && isNextBuildDir(path)) {
        return undefined;
      }
      throw err;
    }
  };

  if (origPromisesWriteFile) {
    fs.promises.writeFile = async function(path, data, options) {
      try {
        return await origPromisesWriteFile.call(fs.promises, path, data, options);
      } catch (err) {
        if (err && (err.code === 'EPERM' || err.code === 'EACCES') && isNextBuildDir(path)) {
          return undefined;
        }
        throw err;
      }
    };
  }

  const origStat = fs.stat;
  const origStatSync = fs.statSync;
  const origLstat = fs.lstat;
  const origLstatSync = fs.lstatSync;
  const origPromisesStat = fs.promises ? fs.promises.stat : null;
  const origPromisesLstat = fs.promises ? fs.promises.lstat : null;

  function toEnoent(path, syscall) {
    const e = new Error(`ENOENT: no such file or directory, ${syscall} '${path}'`);
    e.code = 'ENOENT';
    e.errno = -4058;
    e.syscall = syscall;
    e.path = path;
    return e;
  }

  fs.stat = function(path, options, callback) {
    if (typeof options === 'function') {
      callback = options;
      options = undefined;
    }
    return origStat.call(fs, path, options, (err, stats) => {
      if (err && (err.code === 'EPERM' || err.code === 'EACCES') && isNextBuildDir(path)) {
        return callback(toEnoent(path, 'stat'));
      }
      return callback(err, stats);
    });
  };

  fs.statSync = function(path, options) {
    try {
      return origStatSync.call(fs, path, options);
    } catch (err) {
      if (err && (err.code === 'EPERM' || err.code === 'EACCES') && isNextBuildDir(path)) {
        throw toEnoent(path, 'stat');
      }
      throw err;
    }
  };

  if (origPromisesStat) {
    fs.promises.stat = async function(path, options) {
      try {
        return await origPromisesStat.call(fs.promises, path, options);
      } catch (err) {
        if (err && (err.code === 'EPERM' || err.code === 'EACCES') && isNextBuildDir(path)) {
          throw toEnoent(path, 'stat');
        }
        throw err;
      }
    };
  }

  fs.lstat = function(path, options, callback) {
    if (typeof options === 'function') {
      callback = options;
      options = undefined;
    }
    return origLstat.call(fs, path, options, (err, stats) => {
      if (err && (err.code === 'EPERM' || err.code === 'EACCES') && isNextBuildDir(path)) {
        return callback(toEnoent(path, 'lstat'));
      }
      return callback(err, stats);
    });
  };

  fs.lstatSync = function(path, options) {
    try {
      return origLstatSync.call(fs, path, options);
    } catch (err) {
      if (err && (err.code === 'EPERM' || err.code === 'EACCES') && isNextBuildDir(path)) {
        throw toEnoent(path, 'lstat');
      }
      throw err;
    }
  };

  if (origPromisesLstat) {
    fs.promises.lstat = async function(path, options) {
      try {
        return await origPromisesLstat.call(fs.promises, path, options);
      } catch (err) {
        if (err && (err.code === 'EPERM' || err.code === 'EACCES') && isNextBuildDir(path)) {
          throw toEnoent(path, 'lstat');
        }
        throw err;
      }
    };
  }

  const origRm = fs.rm;
  const origRmSync = fs.rmSync;
  const origPromisesRm = fs.promises ? fs.promises.rm : null;

  if (origRm) {
    fs.rm = function(path, options, callback) {
      if (typeof options === 'function') {
        callback = options;
        options = undefined;
      }
      return origRm.call(fs, path, options, (err) => {
        if (err && (err.code === 'EPERM' || err.code === 'ENOTEMPTY' || err.code === 'EACCES' || err.code === 'ENOENT') && isNextBuildDir(path)) {
          return callback(null);
        }
        return callback(err);
      });
    };
  }

  if (origRmSync) {
    fs.rmSync = function(path, options) {
      try {
        return origRmSync.call(fs, path, options);
      } catch (err) {
        if (err && (err.code === 'EPERM' || err.code === 'ENOTEMPTY' || err.code === 'EACCES' || err.code === 'ENOENT') && isNextBuildDir(path)) {
          return undefined;
        }
        throw err;
      }
    };
  }

  if (origPromisesRm) {
    fs.promises.rm = async function(path, options) {
      try {
        return await origPromisesRm.call(fs.promises, path, options);
      } catch (err) {
        if (err && (err.code === 'EPERM' || err.code === 'ENOTEMPTY' || err.code === 'EACCES' || err.code === 'ENOENT') && isNextBuildDir(path)) {
          return undefined;
        }
        throw err;
      }
    };
  }

  const origUnlink = fs.unlink;
  const origUnlinkSync = fs.unlinkSync;
  const origPromisesUnlink = fs.promises ? fs.promises.unlink : null;

  if (origUnlink) {
    fs.unlink = function(path, callback) {
      return origUnlink.call(fs, path, (err) => {
        if (err && (err.code === 'EPERM' || err.code === 'EACCES' || err.code === 'ENOENT') && isNextBuildDir(path)) {
          return callback(null);
        }
        return callback(err);
      });
    };
  }

  if (origUnlinkSync) {
    fs.unlinkSync = function(path) {
      try {
        return origUnlinkSync.call(fs, path);
      } catch (err) {
        if (err && (err.code === 'EPERM' || err.code === 'EACCES' || err.code === 'ENOENT') && isNextBuildDir(path)) {
          return undefined;
        }
        throw err;
      }
    };
  }

  if (origPromisesUnlink) {
    fs.promises.unlink = async function(path) {
      try {
        return await origPromisesUnlink.call(fs.promises, path);
      } catch (err) {
        if (err && (err.code === 'EPERM' || err.code === 'EACCES' || err.code === 'ENOENT') && isNextBuildDir(path)) {
          return undefined;
        }
        throw err;
      }
    };
  }
}

var PENDING = 'pending'
var FULFILLED = 'fulfilled'
var REJECTED = 'rejected'

function Promise(execute) {
  var self = this;
  self.state = PENDING;
  self.onFullfilledFn = [];
  self.onRejectedFn = [];

  function resolve(value) {
    if (self.state === PENDING) {
      self.state = FULFILLED;
      self.value = value;
      self.onFullfilledFn.forEach(function (f) {
        f(self.value);
      })
    }
  }

  function reject(reason) {
    if (self.state === PENDING) {
      self.state = REJECTED;
      self.reason = reason;
      self.onRejectedFn.forEach(function (f) {
        f(self.reason);
      })
    }
  }
  try {
    execute(resolve, reject);
  } catch (e) {
    reject(e);
  }
}
Promise.prototype.then = function (onFullfilled, onRejected) {
  onFullfilled = typeof onFullfilled === "function" ? onFullfilled : function (x) {
    return x
  };
  onRejected = typeof onRejected === "function" ? onRejected : function (e) {
    throw e
  };
  var self = this;
  var promise;
  switch (self.state) {
    case FULFILLED:
      promise = new Promise(function (resolve, reject) {
        setTimeout(function () {
          try {
            var result = onFullfilled(self.value);
            resolvePromise(promise, result, resolve, reject);
          } catch (e) {
            reject(e)
          }
        })
      });
      break;
    case REJECTED:
      promise = new Promise(function (resolve, reject) {
        setTimeout(function () {
          try {
            var result = onRejected(self.reason);
            resolvePromise(promise, result, resolve, reject);
          } catch (e) {
            reject(e)
          }
        })
      });
      break;
    case PENDING:
      promise = new Promise(function (resolve, reject) {
        self.onFullfilledFn.push(function () {
          setTimeout(function () {
            try {
              var result = onFullfilled(self.value);
              resolvePromise(promise, result, resolve, reject);
            } catch (e) {
              reject(e)
            }
          })
        });
        self.onRejectedFn.push(function () {
          setTimeout(function () {
            try {
              var result = onRejected(self.reason);
              resolvePromise(promise, result, resolve, reject);
            } catch (e) {
              reject(e)
            }
          })
        })
      });
      break;
  }
  return promise;
}

function resolvePromise(promise, x, resolve, reject) {
  if (promise === x) {
    throw new TypeError("x与promise相等");
  }
  var executed;
  if ((x !== null && typeof x === "object") || typeof x === "function") {
    try {
      var then = x.then;
      if (typeof then === "function") {
        then.call(x, function (y) {
          if (executed) return;
          executed = true;
          resolvePromise(promise, y, resolve, reject)
        }, function (e) {
          if (executed) return;
          executed = true;
          reject(e);
        })
      } else {
        resolve(x);
      }
    } catch (e) {
      if (executed) return;
      executed = true;
      reject(e);
    }
  } else {
    resolve(x);
  }
}
/////////////////////////////////////
module.exports = {
  deferred() {
    var resolve, reject
    var promise = new Promise(function (res, rej) {
      resolve = res
      reject = rej
    })
    return {
      promise,
      resolve,
      reject
    }
  }
}
var PENDING = 'pending'
var FULFILLED = 'fulfilled'
var REJECTED = 'rejected'

function Promise(execute) {
  var self = this;
  self.state = PENDING;
  self.onFulfilledFn = [];
  self.onRejectedFn = [];

  function resolve(value) {
    setTimeout(function () {
      if (self.state === PENDING) {
        self.state = FULFILLED;
        self.value = value;
        self.onFulfilledFn.forEach(function (f) {
          f(self.value);
        })
      }
    })
  }

  function reject(reason) {
    setTimeout(function () {
      if (self.state === PENDING) {
        self.state = REJECTED;
        self.reason = reason;
        self.onRejectedFn.forEach(function (f) {
          f(self.reason);
        })
      }
    })
  }
  try {
    execute(resolve, reject);
  } catch (e) {
    reject(e);
  }
}
Promise.prototype.then = function (onFulfilled, onRejected) {
  onFulfilled = typeof onFulfilled === "function" ? onFulfilled : function (x) {
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
            var x = onFulfilled(self.value);
            resolvePromise(promise, x, resolve, reject);
          } catch (reason) {
            reject(reason)
          }
        })
      });
      break;
    case REJECTED:
      promise = new Promise(function (resolve, reject) {
        setTimeout(function () {
          try {
            var x = onRejected(self.reason);
            resolvePromise(promise, x, resolve, reject);
          } catch (reason) {
            reject(reason)
          }
        })
      });
      break;
    case PENDING:
      promise = new Promise(function (resolve, reject) {
        self.onFulfilledFn.push(function () {
          try {
            var x = onFulfilled(self.value);
            resolvePromise(promise, x, resolve, reject);
          } catch (reason) {
            reject(reason)
          }
        });
        self.onRejectedFn.push(function () {
          try {
            var x = onRejected(self.reason);
            resolvePromise(promise, x, resolve, reject);
          } catch (reason) {
            reject(reason)
          }
        })
      });
      break;
  }
  return promise;
}

function resolvePromise(promise, x, resolve, reject) {
  if (promise === x) {
    return reject(new TypeError("x 不能与 promise 相等"));
  }
  if (x instanceof Promise) {
    if (x.state === FULFILLED) {
      resolve(x.value)
    } else if (x.state === REJECTED) {
      reject(x.reason)
    } else {
      x.then(function (y) {
        resolvePromise(promise, y, resolve, reject)
      }, reject)
    }
  } else if ((x !== null) && ((typeof x === 'object') || (typeof x === 'function'))) {
    var executed;
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
/* 为了测试，导出模块 */
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
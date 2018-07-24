import store from './store'

/**
 * A decorator for a component class that makes it to listen to specific events
 *
 * @param keys
 * @returns {decorator}
 */
const listen = (keys) => {
  return function decorator(Class) {
    return (...args) => {
      let oldProto = Class.prototype
      Class = function () {
        store.bind(keys, (storeEventPayload) => {
          this.setState({storeEventPayload})
        })
        if (this.setUp) this.setUp()
      }
      Class.prototype = oldProto
      return new Class(...args)
    }
  }
}

const isEqual = (a, b) => {
  let p, t
  for (p in a) {
    if (typeof b[p] === 'undefined') {
      return false
    }
    if (b[p] && !a[p]) {
      return false
    }
    t = typeof a[p]
    if (t === 'object' && !isEqual(a[p], b[p])) {
      return false
    }
    if (t === 'function' && (typeof b[p] === 'undefined' || a[p].toString() !== b[p].toString())) {
      return false
    }
    if (a[p] !== b[p]) {
      return false
    }
  }
  for (p in b) {
    if (typeof a[p] === 'undefined') {
      return false
    }
  }
  return true
}

export { store, listen, isEqual }

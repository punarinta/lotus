import { AsyncStorage } from 'react-native'

/**
 * A list of event listeners where keys are event keys and values are arrays of functions
 */
let listeners = {}

export default class store {

  /**
   * A flag indicating that the store is ready to use
   */
  static ready = false

  /**
   * Initializes the store
   *
   * @param config
   * @returns {Promise.<void>}
   */
  static async init(config = {}) {

    window.$ = {}

    if (config.persist) {
      this.persist = config.persist
      try {
        const raw = await AsyncStorage.getItem('store')
        if (raw !== null) {
          window.$ = JSON.parse(raw)
        }
        store.emit('STORE_READY')
        store.ready = true
      } catch (error) {
        console.error('Local storage corrupted')
      }
    }
  }

  /**
   * Syncs the store with the device async storage
   *
   * @returns {Promise.<void>}
   */
  static async sync() {

    if (this.persist) {
      const json = Object.keys(window.$)
        .filter(key => this.persist.includes(key))
        .reduce((obj, key) => {
          obj[key] = window.$[key]
          return obj
        }, {})

      try {
        await AsyncStorage.setItem('store', JSON.stringify(json))
      } catch (error) {
        console.error('Error syncing store')
      }
    }
  }

  /**
   * Binds a listener to a keyset
   *
   * @param keys
   * @param classRef
   */
  static bind(keys, classRef) {
    for (let key of keys) {
      if (listeners[key]) {
        listeners[key].push(classRef)
      } else {
        listeners[key] = [classRef]
      }
    }
  }

  /**
   * Emits a specific message to the possible listeners
   *
   * @param key
   * @param payload
   */
  static emit(key, payload = null) {
    console.log('EMIT: ' + key)
    if (typeof listeners[key] !== 'undefined') {
      let i = 0; const iMax = listeners[key].length; for(; i < iMax; i++) {
        listeners[key][i](payload)
      }
    }
  }

  /**
   * Just for debugging
   *
   * @param key
   */
  static log(key = null) {
    console.log('=== STORAGE: ===')
    console.log(typeof window.$[key] === 'undefined' ? window.$ : window.$[key])
  }

  /**
   * Gets an element or uses a default and assures it has a correct type
   *
   * @param path
   * @param def
   * @param root
   * @returns {*}
   */
  static get(path, def = null, root = null) {

    if (!root) {
      root = window.$
      this.currentPath = path
    }

    let pathElements = typeof path === 'string' ? path.split('.') : path

    if (pathElements.length > 1) {
      const newRoot = root[pathElements[0]]
      if (!newRoot) {
        // console.log(`STORE: not found [${this.currentPath}]`)
        return def
      }
      pathElements.shift()
      return this.get(pathElements, def, newRoot)
    } else {
      const el = typeof root[path] === 'undefined' ? def : root[path]
      if (def && typeof def.isArray && typeof el === 'object') {
        if (el === null) {
          return el
        } else {
          return Object.values(el)
        }
      } else {
        return el
      }
    }
  }
}

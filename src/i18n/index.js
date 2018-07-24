import en from './en'

export default class I18n
{
  static lang = 'en'
  static use = en
  static locale = 'en_US'

  /**
   * @param locale
   */
  static init(locale) {
    if (locale) {
      switch (locale.split('_')[0]) {

        default:
          this.lang = 'en'
          this.locale = 'en_US'
          this.use = en
      }
    }
  }

  /**
   * @param path
   * @param root
   * @returns {*}
   */
  static t(path, root = null) {

    if (!root) {
      root = this.use
      this.currentPath = path
    }

    let pathElements = typeof path === 'string' ? path.split('.') : path

    if (pathElements.length > 1) {
      const newRoot = root[pathElements[0]]
      if (!newRoot) {
        return `[${this.currentPath} of ${this.lang.toUpperCase()}]`
      }
      pathElements.shift()
      return this.t(pathElements, newRoot)
    } else {
      return root[path] || `[${this.currentPath} of ${this.lang.toUpperCase()}]`
    }
  }

  /**
   * @param code
   * @param x
   * @returns {*}
   */
  static tx(code, x = {}) {
    let t = this.t(code), key = 'one'
    if (typeof x.count !== 'undefined') {
      switch (this.lang) {
        default:
          key = x.count % 10 === 1 ? 'one' : 'many'
      }
      t = t[key]
    }

    if (typeof x.vars !== 'undefined') {
      for (let i = 0; i < x.vars.length; i++) {
        t = t.replace('%s', x.vars[i]);
      }
    }

    return t
  }
}

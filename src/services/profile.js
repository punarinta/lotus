import store from 'core/store'

class ProfileSvc {
  /**
   * Returns a user profile
   *
   * @param id
   * @returns {*|null}
   */
  static get(id) {
    return $.phonebook[id] || null
  }

  /**
   * Explicitly sets a profile for a user
   *
   * @param id
   * @param info
   */
  static set(id, info) {
    $.phonebook[id] = info
    store.sync()
  }

  /**
   * Updates a user profile keeping old records
   *
   * @param id
   * @param info
   * @returns {*}
   */
  static update(id, info) {
    if ($.phonebook[id] && Object.is($.phonebook[id])) {
      $.phonebook[id] = Object.assign($.phonebook[id], info)
    }

    ProfileSvc.set(id, $.phonebook[id])

    return $.phonebook[id]
  }
}

export { ProfileSvc }

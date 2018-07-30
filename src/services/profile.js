import store from 'core/store'
import PropTypes from 'prop-types'

class ProfileSvc {

  static schema = {
    ver: PropTypes.number.isRequired,
    id: PropTypes.string.isRequired,
    lastSync: PropTypes.number.isRequired,
    lastSeen: PropTypes.number.isRequired,
    peerId: PropTypes.string.isRequired,

    emails: PropTypes.arrayOf(PropTypes.string),
    name: PropTypes.string,
    ava: PropTypes.instanceOf(Uint8Array),
  }

  /**
   * Returns all entries
   *
   * @returns {*}
   */
  static all() {

    const all = []
    for (const id in $.phonebook) {
      all.push({
        ...$.phonebook[id],
        id,
      })
    }

    return all
  }

  /**
   * Returns a user profile
   *
   * @param id
   * @returns {*|null}
   */
  static get(id) {
    if ($.phonebook[id]) {
      return {
        ...$.phonebook[id],
        id,
      }
    } else {
      return null
    }
  }

  /**
   * Finds a profile by his last known peer ID
   *
   * @param peerId
   * @returns {*}
   */
  static findByPeerId(peerId) {
    for (const id in $.phonebook) {
      if ($.phonebook[id].peerId === peerId) {
        return {
          ...$.phonebook[id],
          id,
        }
      }
    }
    return null
  }

  /**
   * Returns a sample user
   *
   * @returns {{id: string, name: string}}
   */
  static johnDoe() {
    return {
      id: 'unknown@lotus.test',
      name: 'Unknown user',
    }
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
    if (typeof $.phonebook[id] === 'object') {
      $.phonebook[id] = Object.assign($.phonebook[id], info)
      ProfileSvc.set(id, $.phonebook[id])
    } else {
      ProfileSvc.set(id, info)
    }

    return {
      ...$.phonebook[id],
      id,
    }
  }
}

export { ProfileSvc }

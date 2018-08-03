import store from 'core/store'
import PropTypes from 'prop-types'

class ProfileSvc {

  static schema = {
    ver: PropTypes.number.isRequired,
    id: PropTypes.string.isRequired,
    peerId: PropTypes.string.isRequired,
    lastSeen: PropTypes.number.isRequired,

    lastUpd: PropTypes.number,                  // last time when profile was updated
    email: PropTypes.string,
    name: PropTypes.string,
    ava: PropTypes.instanceOf(Uint8Array),
  }

  /**
   * Returns all entries
   *
   * @returns {*}
   */
  static all(options = {}) {

    const all = []
    for (const id in $.phonebook) {
      all.push({
        ...$.phonebook[id],
        id,
      })
    }

    if (options.sortBy) {
      all.sort((a, b) => {
        if (options.sortBy === 'lastSeen') {
          return b.lastSeen - a.lastSeen
        }
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

  /**
   * The same as update, but user peerId as a key
   *
   * @param peerId
   * @param info
   * @returns {*}
   */
  static updateByPeerId(peerId, info) {
    for (const id in $.phonebook) {
      if ($.phonebook[id].peerId === peerId) {
        return ProfileSvc.set(id, info)
      }
    }
    return null
  }
}

export { ProfileSvc }
